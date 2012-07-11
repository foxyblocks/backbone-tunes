# root = exports ? window

jsdom = require("jsdom")

require('../public/js/vendor/jquery-1.5.1.min.js')
require('../public/js/Tunes.js')


albumData = [
  title: "Album A"
  artist: "Artist A"
  tracks: [
    title: "Track A"
    url: "/music/Album A Track A.mp3"
  ,
    title: "Track B"
    url: "/music/Album A Track B.mp3"
   ]
,
  title: "Album B"
  artist: "Artist B"
  tracks: [
    title: "Track A"
    url: "/music/Album B Track A.mp3"
  ,
    title: "Track B"
    url: "/music/Album B Track B.mp3"
   ]
 ]
describe "Album", ->
  beforeEach ->
    @album = new Album(albumData[0])

  it "creates from data", ->
    expect(@album.get("tracks").length).toEqual 2

  describe "first track", ->
    it "identifies the correct first track", ->
      expect(@album.isFirstTrack(0)).toBeTruthy

  describe "last track", ->
    it "indentifies the last track", ->
      expect(@album.isLastTrack(1)).toBeTruthy()

  describe "trackUrlAtIndex", ->
    it "returns the URL for a track", ->
      expect(@album.trackUrlAtIndex(0)).toEqual "/music/Album A Track A.mp3"

    it "returns null if no track exists", ->
      expect(@album.trackUrlAtIndex(4)).toBeNull

describe "Playlist", ->
  beforeEach ->
    @playlist = new Playlist()
    @playlist.add albumData[0]

  it "identifies first album as first", ->
    expect(@playlist.isFirstAlbum(0)).toBeTruthy()

  it "identifies first album as first", ->
    expect(@playlist.isFirstAlbum(1)).toBeFalsy()

  it "identifies last album as last", ->
    @playlist.add albumData[1]
    expect(@playlist.isLastAlbum(1)).toBeTruthy()

  it "rejects non last album as last", ->
    @playlist.add albumData[1]
    expect(@playlist.isLastAlbum(0)).toBeFalsy()

describe "Player", ->
  beforeEach ->
    @player = new Player()

  describe "with no items", ->
    it "starts with album 0", ->
      expect(@player.get("currentAlbumIndex")).toEqual 0

    it "starts with track 0", ->
      expect(@player.get("currentTrackIndex")).toEqual 0

  describe "with added album", ->
    beforeEach ->
      @player.playlist.add albumData[0]

    it "is in \"stop\" state", ->
      expect(@player.get("state")).toEqual "stop"

    it "is stopped", ->
      expect(@player.isStopped()).toBeTruthy()

  describe "while playing", ->
    beforeEach ->
      @player.playlist.add albumData[0]
      @player.play()

    it "sets the \"play\" state", ->
      expect(@player.get("state")).toEqual "play"

    it "is playing", ->
      expect(@player.isPlaying()).toBeTruthy()

    it "has a current album", ->
      expect(@player.currentAlbum().get("title")).toEqual "Album A"

    it "has a current track url", ->
      expect(@player.currentTrackUrl()).toEqual "/music/Album A Track A.mp3"

  describe "play()", ->
    beforeEach ->
      @player.playlist.add albumData[0]

    it "should start playing where it left off", ->
      @player.play()
      expect(@player.isPlaying()).toBeTruthy()

    describe "passing only a track index", ->
      it "play that track on current album", ->
        @player.play null, 1
        expect(@player.get("currentAlbumIndex")).toEqual 0
        expect(@player.get("currentTrackIndex")).toEqual 1

    describe "passing only an album index", ->
      it "should play the first track on that album ", ->
        @player.play 1
        expect(@player.get("currentAlbumIndex")).toEqual 1
        expect(@player.get("currentTrackIndex")).toEqual 0

    describe "passing both album and track index", ->
      it "should play the thath track on that album ", ->
        @player.play 1, 1
        expect(@player.get("currentAlbumIndex")).toEqual 1
        expect(@player.get("currentTrackIndex")).toEqual 0

  describe "nextTrack()", ->
    beforeEach ->
      @player.playlist.add albumData[0]
      @player.playlist.add albumData[1]

    it "plays goes to next track in this album", ->
      @player.nextTrack()
      expect(@player.get("currentTrackIndex")).toEqual 1

    describe "when playing last track with more albums left", ->
      it "should play the next album's first track", ->
        @player.nextTrack()
        expect(@player.get("currentTrackIndex")).toEqual 0
        expect(@player.get("currentAlbumIndex")).toEqual 1

    describe "when playing last track in last album", ->
      it "should play the first album's first track", ->
        @player.playlist.remove 1
        @player.set "currentTrackIndex", 1
        @player.nextTrack()
        expect(@player.get("currentTrackIndex")).toEqual 0
        expect(@player.get("currentAlbumIndex")).toEqual 0
