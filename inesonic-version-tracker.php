<?php
/**
 * Plugin Name:       Inesonic Software Version Tracker
 * Description:       A small plugin that provides support for tracking and downloading software packages.
 * Version:           1.0.0
 * Author:            Inesonic,  LLC
 * Author URI:        https://inesonic.com
 * License:           GPLv3
 * License URI:
 * Requires at least: 5.7
 * Requires PHP:      7.4
 * Text Domain:       inesonic-version-tracker
 * Domain Path:       /locale
 ***********************************************************************************************************************
 * Copyright 2021 - 2022, Inesonic, LLC
 *
 * GNU Public License, Version 3:
 *   This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 *   License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
 *   later version.
 *
 *   This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 *   warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 *   details.
 *
 *   You should have received a copy of the GNU General Public License along with this program.  If not, see
 *   <https://www.gnu.org/licenses/>.
 ***********************************************************************************************************************
 * \file inesonic-version-tracker.php
 *
 * Main plug-in file.
 */

require_once __DIR__ . "/include/options.php";
require_once __DIR__ . "/include/menus.php";

/**
 * Inesonic WordPress plug-in that manages software downloads.  The plugin provides both a REST API to query the
 * current software version and short codes that can be used to provide a download button and EULA text.
 */
class InesonicVersionTracker {
    /**
     * The plugin version number.
     */
    const VERSION = '1.0.0';

    /**
     * The plugin slug.
     */
    const SLUG = 'inesonic-version-tracker';

    /**
     * A pretty name for the plugin.
     */
    const NAME = 'Inesonic Software Version Tracker';

    /**
     * The plugin author.
     */
    const AUTHOR = 'Inesonic, LLC';

    /**
     * The plugin prefix.
     */
    const PREFIX = 'InesonicVersionTracker';

    /**
     * Shorter plug-in descriptive name.
     */
    const SHORT_NAME = 'Version Tracker';

    /**
     * Options prefix.
     */
    const OPTIONS_PREFIX = 'inesonic_version_tracker';

    /**
     * The REST API namespace.
     */
    const REST_API_NAMESPACE = 'inesonic/v1';

    /**
     * Package version information endpoint.
     */
    const VERSION_ENDPOINT = '/version';

    /**
     * EULA information endpoint.
     */
    const EULA_ENDPOINT = '/eula';

    /**
     * The singleton class instance.
     */
    private static $instance;  /* Plug-in instance */

    /**
     * Method that is called to initialize a single instance of the plug-in
     */
    public static function instance() {
        if (!isset(self::$instance) && !(self::$instance instanceof InesonicVersionTracker)) {
            self::$instance = new InesonicVersionTracker();
        }
    }

    /**
     * Static method that is triggered when the plug-in is activated.
     */
    public static function plugin_activated() {
        if (defined('ABSPATH') && current_user_can('activate_plugins')) {
            $plugin = isset($_REQUEST['plugin']) ? sanitize_text_field($_REQUEST['plugin']) : '';
            if (check_admin_referer('activate-plugin_' . $plugin)) {
            }
        }
    }

    /**
     * Static method that is triggered when the plug-in is deactivated.
     */
    public static function plugin_uninstalled() {
        if (defined('ABSPATH') && current_user_can('activate_plugins')) {
            $plugin = isset($_REQUEST['plugin']) ? sanitize_text_field($_REQUEST['plugin']) : '';
            if (check_admin_referer('deactivate-plugin_' . $plugin)) {
            }
        }
    }

    /**
     * Constructor
     */
    public function __construct() {
        $this->options = new Inesonic\VersionTracker\Options(self::OPTIONS_PREFIX);
        $this->admin_menus = new Inesonic\VersionTracker\Menus(
            $this->options,
            self::SHORT_NAME,
            self::NAME,
            self::SLUG
        );

        add_action('init', array($this, 'customize_on_initialization'));
    }

    /**
     * Method that performs various initialization tasks during WordPress init phase.
     */
    public function customize_on_initialization() {
        add_shortcode('inesonic_eula_version', array($this, 'inesonic_eula_version'));
        add_shortcode('inesonic_eula_text', array($this, 'inesonic_eula_text'));
        add_shortcode('inesonic_release_version', array($this, 'inesonic_release_version'));
        add_shortcode('inesonic_download_url', array($this, 'inesonic_download_url'));
        add_shortcode('inesonic_shasum', array($this, 'inesonic_shasum'));
        add_shortcode('inesonic_download_button', array($this, 'inesonic_download_button'));

        add_action('rest_api_init', array($this, 'rest_api_initialization'));
    }

    /**
     * Method that initializes our REST API.
     */
    public function rest_api_initialization() {
        register_rest_route(
            self::REST_API_NAMESPACE,
            self::VERSION_ENDPOINT,
            array(
                'methods' => 'POST',
                'callback' => array($this, 'rest_version'),
                'permission_callback' => '__return_true'
            )
        );

        register_rest_route(
            self::REST_API_NAMESPACE,
            self::EULA_ENDPOINT,
            array(
                'methods' => 'POST',
                'callback' => array($this, 'rest_eula'),
                'permission_callback' => '__return_true'
            )
        );
    }

    /**
     * Method that provides a shortcode with the current EULA version.
     *
     * \param[in] $attributes The shortcode attributes.
     *
     * \return Returns the EULA version number.
     */
    public function inesonic_eula_version($attributes) {
        return esc_html($this->options->eula_version());
    }

    /**
     * Method that provides a shortcode with the current EULA text.  Note that text is not escaped so that HTML tags
     * can be rendered correctly.
     *
     * \param[in] $attributes The shortcode attributes.
     *
     * \return Returns the EULA text.
     */
    public function inesonic_eula_text($attributes) {
        return $this->options->eula_text();
    }

    /**
     * Method that provides a shortcode indicating the release version for a specific platform.
     *
     * \param[in] $attributes The shortcode attributes.
     *
     * \return Returns the release version for the platform.
     */
    public function inesonic_release_version($attributes) {
        if (array_key_exists('platform', $attributes)) {
            $platform = $attributes['platform'];
            $result = esc_html($this->options->platform_version($platform));
        } else {
            $result = '<strong>' . __('Missing platform', 'inesonic-version-tracker') . '</strong>';
        }

        return $result;
    }

    /**
     * Method that provides a shortcode indicating the download URL for a specific platform.
     *
     * \param[in] $attributes The shortcode attributes.
     *
     * \return Returns the release version for the platform.
     */
    public function inesonic_download_url($attributes) {
        if (array_key_exists('platform', $attributes)) {
            $platform = $attributes['platform'];
            $result = esc_html($this->options->download_url($platform));
        } else {
            $result = '<strong>' . __('Missing platform', 'inesonic-version-tracker') . '</strong>';
        }

        return $result;
    }

    /**
     * Method that provides a shortcode indicating the SHA-256 checksum for a specific platform.
     *
     * \param[in] $attributes The shortcode attributes.
     *
     * \return Returns the release version for the platform.
     */
    public function inesonic_shasum($attributes) {
        if (array_key_exists('platform', $attributes)) {
            $platform = $attributes['platform'];
            $result = esc_html($this->options->shasum($platform));
        } else {
            $result = '<strong>' . __('Missing platform', 'inesonic-version-tracker') . '</strong>';
        }

        return $result;
    }

    /**
     * Method that provides a smart download button.
     *
     * \param[in] $attributes The shortcode attributes.
     *
     * \return Returns the release version for the platform.
     */
    public function inesonic_download_button($attributes) {
        if (is_array($attributes) && array_key_exists('button_text', $attributes)) {
            $button_text = $attributes['button_text'];
        } else {
            $button_text = __('Download', 'inesonic-version-tracker');
        }

        if (is_array($attributes) && array_key_exists('shasum_text', $attributes)) {
            $shasum_text = $attributes['shasum_text'];
        } else {
            $shasum_text = __('SHA-256 Checksum: ', 'inesonic-version-tracker');
        }

        if (is_array($attributes) && array_key_exists('no_platform_text', $attributes)) {
            $no_platform_text = $attributes['no_platform_text'];
        } else {
            $no_platform_text = __('Select your operating system...', 'inesonic-version-tracker');
        }

        $platforms = $this->options->supported_platforms();
        $platform_data = array();
        foreach ($platforms as $platform) {
            $download_url = $this->options->download_url($platform);
            $shasum = $this->options->shasum($platform);
            $platform_data[$platform] = array(
                'download_url' => $download_url,
                'shasum' => $shasum
            );
        }

        wp_enqueue_script('jquery');
        wp_enqueue_script(
            'inesonic-version-tracker-download-button',
            plugin_dir_url(__FILE__) . 'assets/js/download-button.js',
            array('jquery'),
            null,
            true
        );
        wp_localize_script(
            'inesonic-version-tracker-download-button',
            'platform_data',
            $platform_data
        );

        $result = '<div class="inesonic-download-button-wrapper-area">' .
                    '<span class="inesonic-download-button-wrapper">' .
                      '<div class="inesonic-download-button-platform-select-area">' .
                      '<select id="inesonic-download-button-platform-select" ' .
                              'class="inesonic-download-button-platform-select" ' .
                              'name="inesonic-download-button-platform-select"' .
                    '>' .
                      '<option value="-" ' .
                              'id="inesonic-download-button-platform-option-none" ' .
                              'class="inesonic-download-button-platform-option ' .
                                     'inesonic-download-button-platform-option-none"' .
                      '>' .
                        $no_platform_text .
                      '</option>';

        foreach ($platforms as $platform) {
            $platform_cleaned = preg_replace('/[^a-z0-9]/', '-', strtolower($platform));
            $name = $this->options->platform_name($platform);
            $result .= '<option value="' . esc_html($platform) . '" ' .
                               'id="inesonic-download-button-platform-option-' . $platform_cleaned . '" ' .
                               'class="inesonic-download-button-platform-option"' .
                       '>' .
                         esc_html($name) .
                       '</option>';
        }

        $result .=        '</select>' .
                        '</div>' .
                        '<div class="inesonic-download-button-button-area">' .
                          '<a href="#" id="inesonic-download-button" class="inesonic-download-button">' .
                            $button_text .
                          '</a>' .
                        '</div>' .
                        '<div id="inesonic-download-button-shasum-area" ' .
                             'class="inesonic-download-button-shasum-area">' .
                          $shasum_text .
                          '<br/>' .
                          '<span id="inesonic-download-button-shasum" ' .
                                'class="inesonic-download-button-shasum"' .
                          '>' .
                            '???' .
                          '</span>' .
                        '</div>' .
                      '</span>' .
                    '</div>';

        return $result;
    }

    /**
     * Method that is triggered when package version data is requested.
     *
     * \param $request Request data from this REST API handler.
     */
    public function rest_version(\WP_REST_Request $request) {
        $platforms = $this->options->supported_platforms();
        $response = array();
        foreach ($platforms as $platform) {
            $version = $this->options->platform_version($platform);
            $name = $this->options->platform_name($platform);
            $download_url = $this->options->download_url($platform);
            $shasum = $this->options->shasum($platform);
            $payload_url = $this->options->payload_url($platform);

            $response[$platform] = array(
                'name' => $name,
                'version' => $version,
                'download_url' => $download_url,
                'shasum' => $shasum,
                'payload_url' => $payload_url
            );
        }

        return $response;
    }

    /**
     * Method that is triggered when the Inesonic server sends the final REST API secret.
     *
     * \param $request Request data from this REST API handler.
     */
    public function rest_eula(\WP_REST_Request $request) {
        $eula_version = $this->options->eula_version();
        $eula_text = $this->options->eula_text();

        return array(
            'version' => $eula_version,
            'text' => $eula_text
        );
    }

    /**
     * Static method that logs an error.
     *
     * \param[in] $error_message The error to be logged.
     */
    static private function log_error($error_message) {
        error_log($error_message);
        do_action('inesonic-logger-1', $error_message);
    }
}

/* Instantiate our plug-in. */
InesonicVersionTracker::instance();

/* Define critical global hooks. */
register_activation_hook(__FILE__, array('InesonicVersionTracker', 'plugin_activated'));
register_uninstall_hook(__FILE__, array('InesonicVersionTracker', 'plugin_uninstalled'));
