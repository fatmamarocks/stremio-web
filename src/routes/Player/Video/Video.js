// Copyright (C) 2017-2020 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useLiveRef } = require('stremio/common');
const selectVideoImplementation = require('./selectVideoImplementation');
const styles = require('./styles');

const Video = React.forwardRef(({ className, ...props }, ref) => {
    const onEndedRef = useLiveRef(props.onEnded);
    const onErrorRef = useLiveRef(props.onError);
    const onPropValueRef = useLiveRef(props.onPropValue);
    const onPropChangedRef = useLiveRef(props.onPropChanged);
    const onSubtitlesTrackLoadedRef = useLiveRef(props.onSubtitlesTrackLoaded);
    const onImplementationChangedRef = useLiveRef(props.onImplementationChanged);
    const videoElementRef = React.useRef(null);
    const videoRef = React.useRef(null);
    const dispatch = React.useCallback((action) => {
        if (action && action.type === 'command' && action.commandName === 'load' && action.commandArgs) {
            const Video = selectVideoImplementation(action.commandArgs);
            if (videoRef.current === null || videoRef.current.constructor !== Video) {
                dispatch({ type: 'command', commandName: 'destroy' });
                videoRef.current = new Video({
                    ...action.commandArgs,
                    containerElement: videoElementRef.current
                });
                videoRef.current.on('ended', () => {
                    if (typeof onEndedRef.current === 'function') {
                        onEndedRef.current();
                    }
                });
                videoRef.current.on('error', (args) => {
                    if (typeof onErrorRef.current === 'function') {
                        onErrorRef.current(args);
                    }
                });
                videoRef.current.on('propValue', (propName, propValue) => {
                    if (typeof onPropValueRef.current === 'function') {
                        onPropValueRef.current(propName, propValue);
                    }
                });
                videoRef.current.on('propChanged', (propName, propValue) => {
                    if (typeof onPropChangedRef.current === 'function') {
                        onPropChangedRef.current(propName, propValue);
                    }
                });
                videoRef.current.on('subtitlesTrackLoaded', (track) => {
                    if (typeof onSubtitlesTrackLoadedRef.current === 'function') {
                        onSubtitlesTrackLoadedRef.current(track);
                    }
                });
                if (typeof onImplementationChangedRef.current === 'function') {
                    onImplementationChangedRef.current(videoRef.current.constructor.manifest);
                }
            }
        }

        if (videoRef.current !== null) {
            try {
                videoRef.current.dispatch(action);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(videoRef.current.constructor.manifest.name, error);
            }
        }
    }, []);
    React.useImperativeHandle(ref, () => ({ dispatch }), []);
    React.useEffect(() => {
        return () => {
            dispatch({ type: 'command', commandName: 'destroy' });
        };
    }, []);
    return (
        <div className={classnames(className, styles['video-container'])}>
            <div ref={videoElementRef} className={styles['video']} />
        </div>
    );
});

Video.displayName = 'Video';

Video.propTypes = {
    className: PropTypes.string,
    onEnded: PropTypes.func,
    onError: PropTypes.func,
    onPropValue: PropTypes.func,
    onPropChanged: PropTypes.func,
    onSubtitlesTrackLoaded: PropTypes.func,
    onImplementationChanged: PropTypes.func
};

module.exports = Video;
