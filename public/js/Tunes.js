var __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

window.Album = (function(_super) {

  __extends(Album, _super);

  function Album() {
    Album.__super__.constructor.apply(this, arguments);
  }

  Album.prototype.isFirstTrack = function(index) {
    return index === 0;
  };

  Album.prototype.isLastTrack = function(index) {
    return index >= this.lastTrackIndex();
  };

  Album.prototype.lastTrackIndex = function() {
    return this.get("tracks").length - 1;
  };

  Album.prototype.trackUrlAtIndex = function(index) {
    var track;
    track = this.get('tracks')[index];
    if (track) return track.url;
  };

  return Album;

})(Backbone.Model);

window.Albums = (function(_super) {

  __extends(Albums, _super);

  function Albums() {
    Albums.__super__.constructor.apply(this, arguments);
  }

  Albums.prototype.model = Album;

  Albums.prototype.url = '/albums';

  return Albums;

})(Backbone.Collection);

window.Playlist = (function(_super) {

  __extends(Playlist, _super);

  function Playlist() {
    Playlist.__super__.constructor.apply(this, arguments);
  }

  Playlist.prototype.isFirstAlbum = function(index) {
    return index === 0;
  };

  Playlist.prototype.isLastAlbum = function(index) {
    return index >= this.length - 1;
  };

  return Playlist;

})(Albums);

window.Player = (function(_super) {

  __extends(Player, _super);

  function Player() {
    Player.__super__.constructor.apply(this, arguments);
  }

  Player.prototype.defaults = {
    'currentAlbumIndex': 0,
    'currentTrackIndex': 0,
    'state': "stop"
  };

  Player.prototype.initialize = function() {
    this.playlist = new Playlist;
    return this.bind('change', this.logPlayer);
  };

  Player.prototype.play = function(albumIndex, trackIndex) {
    if ((!(trackIndex != null)) && (albumIndex != null)) trackIndex = 0;
    if (trackIndex != null) {
      this.set({
        'currentTrackIndex': trackIndex
      });
    }
    if (albumIndex != null) {
      this.set({
        'currentAlbumIndex': albumIndex
      });
    }
    return this.set({
      'state': 'play'
    });
  };

  Player.prototype.pause = function() {
    return this.set({
      'state': 'stop'
    });
  };

  Player.prototype.isPlaying = function() {
    return this.get('state') === 'play';
  };

  Player.prototype.isStopped = function() {
    return this.get('state') === 'stop';
  };

  Player.prototype.isLastAlbumTrack = function() {
    return this.get('currentAlbumIndex') === this.playlist.length - 1;
  };

  Player.prototype.currentAlbum = function() {
    return this.playlist.at(this.get('currentAlbumIndex'));
  };

  Player.prototype.currentTrackUrl = function() {
    if (this.currentAlbum() != null) {
      return this.currentAlbum().trackUrlAtIndex(this.get('currentTrackIndex'));
    }
  };

  Player.prototype.playNext = function() {
    var albumIndex, trackIndex;
    albumIndex = this.get('currentAlbumIndex');
    trackIndex = this.get('currentTrackIndex');
    if (this.currentAlbum().isLastTrack(trackIndex)) {
      trackIndex = 0;
      if (this.playlist.isLastAlbum(albumIndex)) {
        albumIndex = 0;
      } else {
        albumIndex++;
      }
    } else {
      trackIndex++;
    }
    return this.set({
      'currentAlbumIndex': albumIndex,
      'currentTrackIndex': trackIndex
    });
  };

  Player.prototype.playPrev = function() {
    var albumIndex, trackIndex;
    albumIndex = this.get('currentAlbumIndex');
    trackIndex = this.get('currentTrackIndex');
    if (this.currentAlbum().isFirstTrack(trackIndex)) {
      if (this.playlist.isFirstAlbum(albumIndex)) {
        albumIndex = this.playlist.length - 1;
      } else {
        albumIndex--;
      }
      trackIndex = this.playlist.at(albumIndex).lastTrackIndex();
    } else {
      trackIndex--;
    }
    return this.play(albumIndex, trackIndex);
  };

  Player.prototype.logPlayer = function() {
    return console.log('Albmum: ', this.attributes.currentAlbumIndex + 1, 'Track: ', this.attributes.currentTrackIndex + 1, 'Status: ', this.attributes.state);
  };

  return Player;

})(Backbone.Model);

window.library = new Albums;

window.player = new Player;

$(function() {
  var App;
  window.AlbumView = (function(_super) {

    __extends(AlbumView, _super);

    function AlbumView() {
      AlbumView.__super__.constructor.apply(this, arguments);
    }

    AlbumView.prototype.tagName = 'li';

    AlbumView.prototype.className = 'album';

    AlbumView.prototype.template = _.template($('#album-template').html());

    AlbumView.prototype.initialize = function() {
      _.bindAll(this, 'render');
      return this.model.bind('change', this.render);
    };

    AlbumView.prototype.render = function() {
      var renderedContent;
      renderedContent = this.template(this.model.toJSON());
      $(this.el).html(renderedContent);
      return this;
    };

    return AlbumView;

  })(Backbone.View);
  window.LibraryAlbumView = (function(_super) {

    __extends(LibraryAlbumView, _super);

    function LibraryAlbumView() {
      LibraryAlbumView.__super__.constructor.apply(this, arguments);
    }

    LibraryAlbumView.prototype.events = {
      'click .queue.add': 'select'
    };

    LibraryAlbumView.prototype.select = function() {
      return this.collection.trigger('select', this.model);
    };

    return LibraryAlbumView;

  })(AlbumView);
  window.PlaylistAlbumView = (function(_super) {

    __extends(PlaylistAlbumView, _super);

    function PlaylistAlbumView() {
      this.removeFromPlaylist = __bind(this.removeFromPlaylist, this);
      this.updateTrack = __bind(this.updateTrack, this);
      this.updateState = __bind(this.updateState, this);
      this.isAlbumCurrent = __bind(this.isAlbumCurrent, this);
      this.render = __bind(this.render, this);
      PlaylistAlbumView.__super__.constructor.apply(this, arguments);
    }

    PlaylistAlbumView.prototype.events = {
      'click .queue.remove': 'removeFromPlaylist'
    };

    PlaylistAlbumView.prototype.initialize = function() {
      _.bindAll(this, 'remove');
      this.model.bind('remove', this.remove);
      this.player = this.options.player;
      this.player.bind('change:state', this.updateState);
      return this.player.bind('change:currentTrackIndex', this.updateTrack);
    };

    PlaylistAlbumView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.updateTrack();
      return this;
    };

    PlaylistAlbumView.prototype.isAlbumCurrent = function() {
      return this.player.currentAlbum() === this.model;
    };

    PlaylistAlbumView.prototype.updateState = function() {
      console.log('playlistAlbumView.updateState()');
      return $(this.el).toggleClass('current', this.isAlbumCurrent());
    };

    PlaylistAlbumView.prototype.updateTrack = function() {
      var currentTrackIndex;
      currentTrackIndex = this.player.get('currentTrackIndex');
      console.log('update track:', currentTrackIndex);
      this.$('li').each(function(index, el) {
        return $(el).toggleClass('current', index === currentTrackIndex);
      });
      return this.updateState();
    };

    PlaylistAlbumView.prototype.removeFromPlaylist = function() {
      return this.options.playlist.remove(this.model);
    };

    return PlaylistAlbumView;

  })(AlbumView);
  window.PlaylistView = (function(_super) {

    __extends(PlaylistView, _super);

    function PlaylistView() {
      this.updateTrack = __bind(this.updateTrack, this);
      this.updateState = __bind(this.updateState, this);
      PlaylistView.__super__.constructor.apply(this, arguments);
    }

    PlaylistView.prototype.tagName = 'section';

    PlaylistView.prototype.className = 'playlist';

    PlaylistView.prototype.template = _.template($('#playlist-template').html());

    PlaylistView.prototype.events = {
      'click .control.play': 'play',
      'click .control.pause': 'pause',
      'click .control.next': 'nextTrack',
      'click .control.prev': 'prevTrack'
    };

    PlaylistView.prototype.initialize = function() {
      _.bindAll(this, 'render', 'queueAlbum', 'renderAlbum');
      this.collection.bind('reset', this.render);
      this.collection.bind('add', this.renderAlbum);
      this.player = this.options.player;
      this.player.bind('change:state', this.updateState);
      this.player.bind('change:currentTrackIndex', this.updateTrack);
      this.audio = new Audio();
      this.library = this.options.library;
      return this.library.bind('select', this.queueAlbum);
    };

    PlaylistView.prototype.render = function() {
      $(this.el).html(this.template(this.player.toJSON()));
      this.updateState();
      return this;
    };

    PlaylistView.prototype.renderAlbum = function(album) {
      var view;
      view = new PlaylistAlbumView({
        model: album,
        player: this.player,
        playlist: this.collection
      });
      return this.$('ul').append(view.render().el);
    };

    PlaylistView.prototype.queueAlbum = function(album) {
      return this.collection.add(album);
    };

    PlaylistView.prototype.updateState = function() {
      this.updateTrack();
      console.log('playing', this.player.isPlaying(), 'stopped', this.player.isStopped());
      this.$('.play').toggle(this.player.isStopped());
      return this.$('.pause').toggle(this.player.isPlaying());
    };

    PlaylistView.prototype.updateTrack = function() {
      console.log('updateTrack()');
      this.audio.src = this.player.currentTrackUrl();
      if (this.player.isPlaying()) {
        return this.audio.play();
      } else {
        return this.audio.pause();
      }
    };

    PlaylistView.prototype.play = function() {
      return this.player.play();
    };

    PlaylistView.prototype.pause = function() {
      return this.player.pause();
    };

    PlaylistView.prototype.nextTrack = function() {
      return this.player.playNext();
    };

    PlaylistView.prototype.prevTrack = function() {
      return this.player.playPrev();
    };

    return PlaylistView;

  })(Backbone.View);
  window.LibraryView = (function(_super) {

    __extends(LibraryView, _super);

    function LibraryView() {
      LibraryView.__super__.constructor.apply(this, arguments);
    }

    LibraryView.prototype.tagName = 'section';

    LibraryView.prototype.className = 'library';

    LibraryView.prototype.initialize = function() {
      _.bindAll(this, 'render');
      this.template = _.template($('#library-template').html());
      return this.collection.bind('reset', this.render);
    };

    LibraryView.prototype.render = function() {
      var $albums, collection;
      collection = this.collection;
      $(this.el).html(this.template({}));
      $albums = this.$('.albums');
      collection.each(function(album) {
        var view;
        view = new LibraryAlbumView({
          model: album,
          collection: collection
        });
        return $albums.append(view.render().el);
      });
      return this;
    };

    return LibraryView;

  })(Backbone.View);
  window.BackboneTunes = (function(_super) {

    __extends(BackboneTunes, _super);

    function BackboneTunes() {
      BackboneTunes.__super__.constructor.apply(this, arguments);
    }

    BackboneTunes.prototype.routes = {
      '': 'home',
      'blank': 'blank'
    };

    BackboneTunes.prototype.initialize = function() {
      this.playlistView = new PlaylistView({
        collection: window.player.playlist,
        player: window.player,
        library: window.library
      });
      return this.libraryView = new LibraryView({
        collection: library
      });
    };

    BackboneTunes.prototype.home = function() {
      var $container;
      $container = $('#container');
      $container.empty();
      $container.append(this.playlistView.render().el);
      return $container.append(this.libraryView.render().el);
    };

    BackboneTunes.prototype.blank = function() {
      $('#container').empty();
      return $('#container').text('blank');
    };

    return BackboneTunes;

  })(Backbone.Router);
  App = new BackboneTunes();
  return Backbone.history.start({
    pushState: true
  });
});
