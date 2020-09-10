// Copyright (C) 2017-2020 Smart code 203358507

const { ChromecastVideo, HTMLVideo, YouTubeVideo, withStreamingServer, withHTMLSubtitles } = require('@stremio/stremio-video');

const selectVideoImplementation = (args) => {
    // TODO handle stream.behaviorHints
    // TODO handle IFrameVideo
    // TODO handle MPVVideo

    if (args.chromecastTransport && args.chromecastTransport.getCastState() === cast.framework.CastState.CONNECTED) {
        return ChromecastVideo;
    }

    if (args.stream && typeof args.stream.ytId === 'string') {
        return withHTMLSubtitles(YouTubeVideo);
    }

    if (typeof args.streamingServerURL === 'string') {
        return withHTMLSubtitles(withStreamingServer(HTMLVideo));
    }

    return withHTMLSubtitles(HTMLVideo);
};

module.exports = selectVideoImplementation;
