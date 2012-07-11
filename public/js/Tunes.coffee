
  class window.Album extends Backbone.Model
    isFirstTrack : (index) ->
      index is 0

    isLastTrack : (index) ->
      index >= @lastTrackIndex()

    lastTrackIndex: ->
      @get("tracks").length - 1

    trackUrlAtIndex : (index) ->
      track = @get('tracks')[index]
      return track.url if track

  class window.Albums extends Backbone.Collection
    model : Album
    url   : '/albums'

  class window.Playlist extends Albums
    isFirstAlbum: (index) ->
      index is 0

    isLastAlbum: (index) ->
      index >= @length - 1


  class window.Player extends Backbone.Model
    defaults:
      'currentAlbumIndex': 0
      'currentTrackIndex': 0
      'state': "stop"

    initialize: ->
      @playlist = new Playlist

      this.bind 'change', @logPlayer


    play: (albumIndex, trackIndex) ->
      if (not trackIndex?) and albumIndex?
        trackIndex = 0 #default for changing album

      @set('currentTrackIndex':trackIndex) if trackIndex?
      @set('currentAlbumIndex':albumIndex) if albumIndex?

      @set('state': 'play')



    pause: ->
      @set({'state': 'stop'})

    isPlaying: ->
      this.get('state') is 'play'

    isStopped: ->
      @get('state') is 'stop'

    isLastAlbumTrack: ->
      @get('currentAlbumIndex') is @playlist.length - 1

    currentAlbum: ->
      @playlist.at(@get 'currentAlbumIndex')

    currentTrackUrl: ->
      if @currentAlbum()?
        this.currentAlbum().trackUrlAtIndex @get('currentTrackIndex')


    playNext: ->
      albumIndex = @get('currentAlbumIndex')
      trackIndex = @get('currentTrackIndex')

      if this.currentAlbum().isLastTrack(trackIndex)
        trackIndex = 0

        if @playlist.isLastAlbum(albumIndex)
          albumIndex = 0
        else
          albumIndex++

      else
        trackIndex++



      @set('currentAlbumIndex':albumIndex, 'currentTrackIndex':trackIndex)

    playPrev: ->
      albumIndex = @get('currentAlbumIndex')
      trackIndex = @get('currentTrackIndex')

      if this.currentAlbum().isFirstTrack(trackIndex)

        if @playlist.isFirstAlbum(albumIndex)
          albumIndex = @playlist.length - 1
        else
          albumIndex--

        trackIndex = @playlist.at(albumIndex).lastTrackIndex()

      else
        trackIndex--



      this.play(albumIndex, trackIndex)

    logPlayer: ->
      console.log 'Albmum: ' , @attributes.currentAlbumIndex + 1 ,
                  'Track: '  , @attributes.currentTrackIndex + 1 ,
                  'Status: ' , @attributes.state




  window.library = new Albums
  window.player = new Player

  $ ->

    class window.AlbumView extends Backbone.View
      tagName: 'li'
      className: 'album'
      template: _.template $('#album-template').html()

      initialize : ->
        _.bindAll this, 'render'
        @model.bind 'change', @render

      render: ->
        renderedContent = @template @model.toJSON()
        $(@el).html renderedContent
        @


    class window.LibraryAlbumView extends AlbumView
      events: {
        'click .queue.add': 'select'
      }

      select: ->
        @collection.trigger 'select', @model

    class window.PlaylistAlbumView extends AlbumView
      events: {
        'click .queue.remove': 'removeFromPlaylist'
      }

      initialize: ->
        _.bindAll(this, 'remove')
        @model.bind 'remove', @remove
        @player = @options.player
        @player.bind 'change:state', @updateState
        @player.bind 'change:currentTrackIndex', @updateTrack

      render: =>
        $(@el).html @template(@model.toJSON())
        @updateTrack()

        @

      isAlbumCurrent: =>
        @player.currentAlbum() is @model

      updateState: =>
        console.log('playlistAlbumView.updateState()')
        $(@el).toggleClass 'current', @isAlbumCurrent()


      updateTrack: =>
        currentTrackIndex = @player.get 'currentTrackIndex'
        console.log 'update track:', currentTrackIndex
        this.$('li').each (index, el) ->
          $(el).toggleClass('current', (index is currentTrackIndex))

        @updateState()





      removeFromPlaylist: =>
        @options.playlist.remove @model

    class window.PlaylistView extends Backbone.View
      tagName: 'section'
      className: 'playlist'
      template: _.template $('#playlist-template').html()

      events:
        'click .control.play': 'play'
        'click .control.pause': 'pause'
        'click .control.next': 'nextTrack'
        'click .control.prev': 'prevTrack'

      initialize: ->
        _.bindAll this, 'render', 'queueAlbum', 'renderAlbum'

        @collection.bind 'reset', @render
        @collection.bind 'add', @renderAlbum

        @player = @options.player
        @player.bind 'change:state', @updateState
        @player.bind 'change:currentTrackIndex', @updateTrack

        @audio = new Audio()
        @library = @options.library
        @library.bind 'select', @queueAlbum

      render: ->
        $(@el).html(@template(@player.toJSON()))

        @updateState()

        @

      renderAlbum: (album) ->
        view = new PlaylistAlbumView
          model: album
          player: @player
          playlist: @collection

        this.$('ul').append view.render().el

      queueAlbum: (album) ->
        @collection.add(album)

      updateState: =>
        @updateTrack()
        console.log 'playing', @player.isPlaying(), 'stopped', @player.isStopped()
        this.$('.play').toggle @player.isStopped()
        this.$('.pause').toggle @player.isPlaying()

      updateTrack: =>
        console.log 'updateTrack()'
        @audio.src = @player.currentTrackUrl()

        if @player.isPlaying()
          @audio.play()
        else
          @audio.pause()


      play: -> @player.play()
      pause: -> @player.pause()
      nextTrack: -> @player.playNext()
      prevTrack: -> @player.playPrev()



    class window.LibraryView extends Backbone.View
      tagName: 'section'
      className: 'library'

      initialize: ->
        _.bindAll this, 'render'
        @template = _.template $('#library-template').html()
        @collection.bind 'reset', @render

      render: ->
        collection = @collection

        $(@el).html @template({})
        $albums = @$('.albums')

        collection.each (album) ->
          view = new LibraryAlbumView
            model: album
            collection: collection

          $albums.append view.render().el

        @




    class window.BackboneTunes extends Backbone.Router
      routes:
        '': 'home'
        'blank': 'blank'

      initialize: ->
        @playlistView = new PlaylistView
          collection: window.player.playlist
          player: window.player
          library: window.library


        @libraryView = new LibraryView
          collection: library



      home: ->
        $container = $ '#container'
        $container.empty()
        $container.append @playlistView.render().el
        $container.append @libraryView.render().el

      blank: ->
        $('#container').empty()
        $('#container').text 'blank'


    App = new BackboneTunes()
    Backbone.history.start pushState: true



