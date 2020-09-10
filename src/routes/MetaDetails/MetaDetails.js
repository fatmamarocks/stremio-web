// Copyright (C) 2017-2020 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { VerticalNavBar, HorizontalNavBar, MetaPreview, ModalDialog, Image, useInLibrary } = require('stremio/common');
const StreamsList = require('./StreamsList');
const VideosList = require('./VideosList');
const useMetaDetails = require('./useMetaDetails');
const useMetaExtensions = require('./useMetaExtensions');
const styles = require('./styles');

const MetaDetails = ({ urlParams, queryParams }) => {
    const metaDetails = useMetaDetails(urlParams);
    const { tabs, selectedMetaExtension, clearSelectedMetaExtension } = useMetaExtensions(metaDetails.meta_resources);
    const metaResourceRef = React.useMemo(() => {
        return metaDetails.selected !== null ? metaDetails.selected.meta_resources_ref : null;
    }, [metaDetails.selected]);
    const selectedMetaResource = React.useMemo(() => {
        return metaDetails.meta_resources.reduceRight((result, metaResource) => {
            if (metaResource.content.type === 'Ready') {
                return metaResource;
            }

            return result;
        }, null);
    }, [metaDetails]);
    const streamsResourceRef = metaDetails.selected !== null ? metaDetails.selected.streams_resource_ref : null;
    const streamsResources = metaDetails.streams_resources;
    const seasonQueryParam = React.useMemo(() => {
        return queryParams.has('season') && !isNaN(queryParams.get('season')) ?
            parseInt(queryParams.get('season'))
            :
            null;
    }, [queryParams]);
    const seasonOnSelect = React.useCallback((event) => {
        window.location.replace(`#/metadetails/${selectedMetaResource.request.path.type_name}/${selectedMetaResource.request.path.id}?season=${event.value}`);
    }, [selectedMetaResource]);
    const selectedVideo = React.useMemo(() => {
        return streamsResourceRef !== null && selectedMetaResource !== null ?
            selectedMetaResource.content.content.videos.reduce((result, video) => {
                if (video.id === streamsResourceRef.id) {
                    return video;
                }

                return result;
            }, null)
            :
            null;
    }, [selectedMetaResource, streamsResourceRef]);
    const [inLibrary, toggleInLibrary] = useInLibrary(selectedMetaResource !== null ? selectedMetaResource.content.content : null);
    return (
        <div className={styles['metadetails-container']}>
            <HorizontalNavBar
                className={styles['nav-bar']}
                backButton={true}
                title={selectedMetaResource !== null ? selectedMetaResource.content.content.name : null}
            />
            <div className={styles['metadetails-content']}>
                {
                    tabs.length > 0 ?
                        <VerticalNavBar
                            className={styles['vertical-nav-bar']}
                            tabs={tabs}
                            selected={selectedMetaExtension !== null ? selectedMetaExtension.url : null}
                        />
                        :
                        null
                }
                {
                    metaResourceRef === null ?
                        <div className={styles['meta-message-container']}>
                            <Image className={styles['image']} src={'/images/empty.png'} alt={' '} />
                            <div className={styles['message-label']}>No meta was selected!</div>
                        </div>
                        :
                        metaDetails.meta_resources.length === 0 ?
                            <div className={styles['meta-message-container']}>
                                <Image className={styles['image']} src={'/images/empty.png'} alt={' '} />
                                <div className={styles['message-label']}>No addons ware requested for this meta!</div>
                            </div>
                            :
                            metaDetails.meta_resources.every((metaResource) => metaResource.content.type === 'Err') ?
                                <div className={styles['meta-message-container']}>
                                    <Image className={styles['image']} src={'/images/empty.png'} alt={' '} />
                                    <div className={styles['message-label']}>No metadata was found!</div>
                                </div>
                                :
                                selectedMetaResource !== null ?
                                    <React.Fragment>
                                        {
                                            typeof selectedMetaResource.content.content.background === 'string' &&
                                                selectedMetaResource.content.content.background.length > 0 ?
                                                <div className={styles['background-image-layer']}>
                                                    <Image
                                                        className={styles['background-image']}
                                                        src={selectedMetaResource.content.content.background}
                                                        alt={' '}
                                                    />
                                                </div>
                                                :
                                                null
                                        }
                                        <MetaPreview
                                            className={styles['meta-preview']}
                                            name={selectedMetaResource.content.content.name + (selectedVideo !== null && typeof selectedVideo.title === 'string' ? ` - ${selectedVideo.title}` : '')}
                                            logo={selectedMetaResource.content.content.logo}
                                            runtime={selectedMetaResource.content.content.runtime}
                                            releaseInfo={selectedMetaResource.content.content.releaseInfo}
                                            released={selectedMetaResource.content.content.released}
                                            description={
                                                selectedVideo !== null && typeof selectedVideo.overview === 'string' && selectedVideo.overview.length > 0 ?
                                                    selectedVideo.overview
                                                    :
                                                    selectedMetaResource.content.content.description
                                            }
                                            links={selectedMetaResource.content.content.links}
                                            trailers={selectedMetaResource.content.content.trailers}
                                            inLibrary={inLibrary}
                                            toggleInLibrary={toggleInLibrary}
                                        />
                                    </React.Fragment>
                                    :
                                    <MetaPreview.Placeholder className={styles['meta-preview']} />
                }
                <div className={styles['spacing']} />
                {
                    streamsResourceRef !== null ?
                        <StreamsList
                            className={styles['streams-list']}
                            streamsResources={streamsResources}
                        />
                        :
                        metaResourceRef !== null ?
                            <VideosList
                                className={styles['videos-list']}
                                metaResource={selectedMetaResource}
                                season={seasonQueryParam}
                                seasonOnSelect={seasonOnSelect}
                            />
                            :
                            null
                }
            </div>
            {
                selectedMetaExtension !== null ?
                    <ModalDialog
                        className={styles['meta-extension-modal-container']}
                        title={selectedMetaExtension.name}
                        onCloseRequest={clearSelectedMetaExtension}>
                        <iframe
                            className={styles['meta-extension-modal-iframe']}
                            sandbox={'allow-forms allow-scripts allow-same-origin'}
                            src={selectedMetaExtension.url}
                        />
                    </ModalDialog>
                    :
                    null
            }
        </div>
    );
};

MetaDetails.propTypes = {
    urlParams: PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.string,
        videoId: PropTypes.string
    }),
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

module.exports = MetaDetails;
