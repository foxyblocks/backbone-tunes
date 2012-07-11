var albumData = [{
    "title":  "Album A",
    "artist": "Artist A",
    "tracks": [
        {
            "title": "Track A",
            "url": "/music/Album A Track A.mp3"
        },
        {
            "title": "Track B",
            "url": "/music/Album A Track B.mp3"
        }]
}, {
    "title": "Album B",
    "artist": "Artist B",
    "tracks": [
        {
            "title": "Track A",
            "url": "/music/Album B Track A.mp3"
        },
        {
            "title": "Track B",
            "url": "/music/Album B Track B.mp3"
    }]
}];


describe("Album", function () {
    beforeEach(function () {
        this.album = new Album(albumData[0]);
    });

    it("creates from data", function () {
        expect(this.album.get('tracks').length).toEqual(2);
    });

    describe('first track', function () {
      it('identifies the correct first track', function () {
        expect(this.album.isFirstTrack(0)).toBeTruthy;
      });
    });

    describe('last track', function () {
      it('indentifies the last track', function () {
        expect(this.album.isLastTrack(1)).toBeTruthy();
      });
    });

    describe('trackUrlAtIndex', function () {
      it('returns the URL for a track', function() {
        expect(this.album.trackUrlAtIndex(0))
        .toEqual('/music/Album A Track A.mp3');
      });

      it('returns null if no track exists', function() {
        expect(this.album.trackUrlAtIndex(4))
        .toBeNull;
      });
    });

});

describe('Playlist', function () {
  beforeEach(function () {
    this.playlist = new Playlist();
    this.playlist.add(albumData[0]);
  });

  it('identifies first album as first', function () {
    expect(this.playlist.isFirstAlbum(0)).toBeTruthy();
  });

  it('identifies first album as first', function () {
    expect(this.playlist.isFirstAlbum(1)).toBeFalsy();
  });

  it('identifies last album as last', function () {
    this.playlist.add(albumData[1]);
    expect(this.playlist.isLastAlbum(1)).toBeTruthy();
  });

  it('rejects non last album as last', function () {
    this.playlist.add(albumData[1]);
    expect(this.playlist.isLastAlbum(0)).toBeFalsy();
  });
});

describe('Player', function () {
  beforeEach(function () {
    this.player = new Player();
  });

  describe('with no items', function () {

    it('starts with album 0', function () {
      expect(this.player.get('currentAlbumIndex')).toEqual(0);
    });

    it('starts with track 0', function() {
      expect(this.player.get('currentTrackIndex')).toEqual(0);
    });
  });

  describe('with added album', function () {
    beforeEach(function () {
      this.player.playlist.add(albumData[0]);
    });

    it('is in "stop" state', function () {
      expect(this.player.get('state')).toEqual('stop');
    });

    it('is stopped', function () {
      expect(this.player.isStopped()).toBeTruthy();
    });
  });

  describe('while playing', function () {
    beforeEach(function () {
      this.player.playlist.add(albumData[0]);
      this.player.play();
    });

    it('sets the "play" state', function () {
      expect(this.player.get('state')).toEqual('play');
    });

    it('is playing', function () {
      expect(this.player.isPlaying()).toBeTruthy();
    });

    it('has a current album', function() {
      expect(this.player.currentAlbum().get('title')).toEqual('Album A');
    });

    it('has a current track url', function() {
      expect(this.player.currentTrackUrl()).toEqual('/music/Album A Track A.mp3');
    });
  });

  describe('play()', function () {
    beforeEach(function () {
      this.player.playlist.add(albumData[0]);
    });

    it('should start playing where it left off', function () {
      this.player.play();
      expect(this.player.isPlaying()).toBeTruthy();
    });

    describe('passing only a track index', function () {
      it('play that track on current album', function () {
        this.player.play(null, 1);
        expect(this.player.get('currentAlbumIndex')).toEqual(0);
        expect(this.player.get('currentTrackIndex')).toEqual(1);
      });
    });

    describe('passing only an album index', function () {
      it('should play the first track on that album ', function () {
        this.player.play(0, 1);
        this.player.play(1);
        expect(this.player.get('currentAlbumIndex')).toEqual(1);
        expect(this.player.get('currentTrackIndex')).toEqual(0);
      });
    });

    describe('passing both album and track index', function () {
      it('should play that track on that album ', function () {
        this.player.play(1, 1);
        expect(this.player.get('currentAlbumIndex')).toEqual(1);
        expect(this.player.get('currentTrackIndex')).toEqual(1);
      });
    });
  });


  describe('playNext()', function () {
    beforeEach(function () {
      this.player.playlist.add(albumData[0]);
      this.player.playlist.add(albumData[1]);
    });

    it('plays next track in this album', function () {
      this.player.playNext();
      expect(this.player.get('currentTrackIndex')).toEqual(1);
    });

    describe('when playing last track with more albums left', function () {
      it("should play the next album's first track", function () {
        this.player.playNext();
        this.player.playNext();
        track = this.player.get('currentTrackIndex');
        album = this.player.get('currentAlbumIndex');
        expect(track).toEqual(0);
        expect(album).toEqual(1);
      });
    });

    describe('when playing last track in last album', function () {
      it("play the first track in first album", function () {
        this.player.play(1, 1);
        this.player.playNext();
        track = this.player.get('currentTrackIndex');
        album = this.player.get('currentAlbumIndex');
        expect(track).toEqual(0);
        expect(album).toEqual(0);
      });
    });
  });

  describe('playPrev()', function () {
    beforeEach(function () {
      this.player.playlist.add(albumData[0]);
      this.player.playlist.add(albumData[1]);
    });

    it('plays prev track in this album', function () {
      this.player.play(0, 1)
      this.player.playPrev();
      expect(this.player.get('currentTrackIndex')).toEqual(0);
    });

    describe('when playing first track with a prev album', function () {
      beforeEach(function () {
        this.player.play(1, 0);
        this.player.playPrev();
      });

      it("should play the prev album", function () {
        expect(this.player.get('currentAlbumIndex')).toEqual(0);
      });

      it('should play the last track', function() {
        expect(this.player.get('currentTrackIndex')).toEqual(1);
      });

    });

    describe('when playing first track in first album', function () {
      beforeEach(function () {
        this.player.play(0, 0);
        this.player.playPrev();
      });

      it("should play the last album", function () {
        expect(this.player.get('currentAlbumIndex')).toEqual(1);
      });

      it('should play the last track', function() {
        expect(this.player.get('currentTrackIndex')).toEqual(1);
      });
    });
  });
});
