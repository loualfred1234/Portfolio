#!/usr/bin/perl
# Aperçu local du site, avec les mêmes URLs propres que Vercel.
# Usage (depuis le dossier du projet) :  perl serve.pl      puis ouvrir http://localhost:4321
# Arrêter : Ctrl + C
use strict; use warnings;
use HTTP::Daemon; use HTTP::Status; use HTTP::Response; use URI::Escape;
use FindBin;
my $root = $ARGV[0] || $FindBin::Bin;
my $port = $ARGV[1] || 4321;
my %types = (html=>'text/html; charset=utf-8', css=>'text/css', js=>'text/javascript', svg=>'image/svg+xml', json=>'application/json', png=>'image/png', jpg=>'image/jpeg', jpeg=>'image/jpeg', webp=>'image/webp', avif=>'image/avif', ico=>'image/x-icon', pdf=>'application/pdf', mp4=>'video/mp4');
my $d = HTTP::Daemon->new(LocalAddr=>'127.0.0.1', LocalPort=>$port, ReuseAddr=>1) or die "Impossible d'ouvrir le port $port : $!\n";
$| = 1; print "Aperçu disponible sur http://localhost:$port  (Ctrl + C pour arrêter)\n";
while (my $c = $d->accept) {
  while (my $r = $c->get_request) {
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
      $res->content($body);
      $c->send_response($res);
    } else { $c->send_error(RC_NOT_FOUND); }
  }
  $c->close; undef $c;
}
