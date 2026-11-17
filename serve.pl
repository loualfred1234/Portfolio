#!/usr/bin/perl
# Aperçu local du site, avec les mêmes URLs propres que Vercel.
# Usage (depuis le dossier du projet) :  perl serve.pl      puis ouvrir http://localhost:4321
# Autre port :  perl serve.pl . 4322
# Arrêter : Ctrl + C
use strict; use warnings;
use HTTP::Daemon; use HTTP::Status; use HTTP::Response; use URI::Escape;
use FindBin; use POSIX ":sys_wait_h";
my $root = (defined $ARGV[0] && $ARGV[0] ne '' && $ARGV[0] ne '.') ? $ARGV[0] : $FindBin::Bin;
my $port = $ARGV[1] || 4321;
my %types = (html=>'text/html; charset=utf-8', css=>'text/css', js=>'text/javascript', svg=>'image/svg+xml', json=>'application/json', png=>'image/png', jpg=>'image/jpeg', jpeg=>'image/jpeg', webp=>'image/webp', avif=>'image/avif', ico=>'image/x-icon', pdf=>'application/pdf', mp4=>'video/mp4', woff2=>'font/woff2');

my $d = HTTP::Daemon->new(LocalAddr=>'127.0.0.1', LocalPort=>$port, ReuseAddr=>1, Listen=>64)
  or die "Impossible d'ouvrir le port $port : $!\n(Un aperçu tourne peut-être déjà : ouvre simplement http://localhost:$port, ou choisis un autre port : perl serve.pl . 4322)\n";
$| = 1;
print "Aperçu disponible sur http://localhost:$port  (Ctrl + C pour arrêter)\n";

# Nettoie les processus enfants terminés
$SIG{CHLD} = sub { 1 while waitpid(-1, WNOHANG) > 0 };

while (1) {
  my $c = $d->accept or next;           # accept peut être interrompu par SIGCHLD
  my $pid = fork;
  if (!defined $pid) { $c->close; next; }
  if ($pid) { $c->close; next; }        # parent : retourne écouter
  # enfant : une requête par connexion, puis fermeture
  if (my $r = $c->get_request) {
    $c->force_last_request;
    my $p = uri_unescape($r->uri->path);
    $p =~ s/\.\.//g; $p = '/index' if $p eq '/'; $p =~ s{/$}{};
    my ($f) = grep { -f $_ } ("$root$p", "$root$p.html", "$root$p/index.html");
    my $status = 200;
    unless ($f) { $f = "$root/404.html"; $status = 404; }
    if (-f $f) {
      my ($ext) = $f =~ /\.(\w+)$/; open my $fh, '<:raw', $f; local $/; my $body = <$fh>; close $fh;
      my $res = HTTP::Response->new($status);
      $res->header('Content-Type' => $types{lc($ext || '')} || 'application/octet-stream');
      $res->header('Cache-Control' => 'no-store');
      $res->header('Connection' => 'close');
      $res->content($body);
      $c->send_response($res);
    } else { $c->send_error(RC_NOT_FOUND); }
  }
  $c->close;
  exit 0;
}
