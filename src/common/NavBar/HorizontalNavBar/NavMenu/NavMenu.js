// Copyright (C) 2017-2020 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('@stremio/stremio-icons/dom');
const { useServices } = require('stremio/services');
const Button = require('stremio/common/Button');
const Popup = require('stremio/common/Popup');
const useBinaryState = require('stremio/common/useBinaryState');
const useFullscreen = require('stremio/common/useFullscreen');
const useProfile = require('stremio/common/useProfile');
const styles = require('./styles');

const NavMenu = (props) => {
    const { core } = useServices();
    const profile = useProfile();
    const [menuOpen, , closeMenu, toggleMenu] = useBinaryState(false);
    const [fullscreen, requestFullscreen, exitFullscreen] = useFullscreen();
    const popupLabelOnClick = React.useCallback((event) => {
        if (!event.nativeEvent.togglePopupPrevented) {
            toggleMenu();
        }
    }, [toggleMenu]);
    const popupMenuOnClick = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);
    const logoutButtonOnClick = React.useCallback(() => {
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Logout'
            }
        });
    }, []);
    const renderLabel = React.useMemo(() => ({ ref, className, children }) => (
        props.renderLabel({
            ref,
            className: classnames(className, { 'active': menuOpen }),
            onClick: popupLabelOnClick,
            children,
        })
    ), [menuOpen, popupLabelOnClick, props.renderLabel]);
    const renderMenu = React.useMemo(() => () => (
        <div className={styles['nav-menu-container']} onClick={popupMenuOnClick}>
            <div className={styles['user-info-container']}>
                <div
                    className={styles['avatar-container']}
                    style={{
                        backgroundImage: profile.auth === null ?
                            'url(\'/images/anonymous.png\')'
                            :
                            `url('${profile.auth.user.avatar}'), url('/images/default_avatar.png')`
                    }}
                />
                <div className={styles['email-container']}>
                    <div className={styles['email-label']}>{profile.auth === null ? 'Anonymous user' : profile.auth.user.email}</div>
                </div>
                <Button className={styles['logout-button-container']} title={profile.auth === null ? 'Log in / Sign up' : 'Log out'} href={'#/intro'} onClick={logoutButtonOnClick}>
                    <div className={styles['logout-label']}>{profile.auth === null ? 'Log in / Sign up' : 'Log out'}</div>
                </Button>
            </div>
            <div className={styles['nav-menu-section']}>
                <Button className={styles['nav-menu-option-container']} title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} onClick={fullscreen ? exitFullscreen : requestFullscreen}>
                    <Icon className={styles['icon']} icon={fullscreen ? 'ic_exit_fullscreen' : 'ic_fullscreen'} />
                    <div className={styles['nav-menu-option-label']}>{fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</div>
                </Button>
            </div>
            <div className={styles['nav-menu-section']}>
                <Button className={styles['nav-menu-option-container']} title={'Settings'} href={'#/settings'}>
                    <Icon className={styles['icon']} icon={'ic_settings'} />
                    <div className={styles['nav-menu-option-label']}>Settings</div>
                </Button>
                <Button className={styles['nav-menu-option-container']} title={'Addons'} href={'#/addons'}>
                    <Icon className={styles['icon']} icon={'ic_addons'} />
                    <div className={styles['nav-menu-option-label']}>Addons</div>
                </Button>
                <Button className={styles['nav-menu-option-container']} title={'Remote Control'} disabled={true}>
                    <Icon className={styles['icon']} icon={'ic_remote'} />
                    <div className={styles['nav-menu-option-label']}>Remote Control</div>
                </Button>
                <Button className={styles['nav-menu-option-container']} title={'Play Magnet Link'} disabled={true}>
                    <Icon className={styles['icon']} icon={'ic_magnet'} />
                    <div className={styles['nav-menu-option-label']}>Play Magnet Link</div>
                </Button>
                <Button className={styles['nav-menu-option-container']} title={'Help & Feedback'} href={'https://stremio.zendesk.com/'} target={'_blank'}>
                    <Icon className={styles['icon']} icon={'ic_help'} />
                    <div className={styles['nav-menu-option-label']}>Help & Feedback</div>
                </Button>
            </div>
            <div className={styles['nav-menu-section']}>
                <Button className={styles['nav-menu-option-container']} title={'Terms of Service'} href={'https://www.stremio.com/tos'} target={'_blank'}>
                    <div className={styles['nav-menu-option-label']}>Terms of Service</div>
                </Button>
                <Button className={styles['nav-menu-option-container']} title={'Privacy Policy'} href={'https://www.stremio.com/privacy'} target={'_blank'}>
                    <div className={styles['nav-menu-option-label']}>Privacy Policy</div>
                </Button>
                <Button className={styles['nav-menu-option-container']} title={'About Stremio'} href={'https://www.stremio.com/'} target={'_blank'}>
                    <div className={styles['nav-menu-option-label']}>About Stremio</div>
                </Button>
            </div>
        </div>
    ), [profile, fullscreen]);
    return (
        <Popup
            open={menuOpen}
            onCloseRequest={closeMenu}
            renderLabel={renderLabel}
            renderMenu={renderMenu}
        />
    );
};

NavMenu.propTypes = {
    renderLabel: PropTypes.func
};

module.exports = NavMenu;
