<?php
 /**********************************************************************************************************************
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
 */

namespace Inesonic\VersionTracker;
    require_once dirname(__FILE__) . '/helpers.php';
    require_once dirname(__FILE__) . '/options.php';

    /**
     * Class that manages the plug-in admin panel menus.
     */
    class Menus {
        /**
         * Static method that is triggered when the plug-in is activated.
         *
         * \param $options The plug-in options instance.
         */
        public static function plugin_activated(Options $options) {}

        /**
         * Static method that is triggered when the plug-in is deactivated.
         *
         * \param $options The plug-in options instance.
         */
        public static function plugin_deactivated(Options $options) {}

        /**
         * Constructor
         *
         * \param $options           The plug-in options handler.
         *
         * \param $short_plugin_name A short version of the plug-in name to be used in the menus.
         *
         * \param $plugin_name       The user visible name for this plug-in.
         *
         * \param $plugin_slug       The slug used for the plug-in.  We use this slug as a prefix for slugs this class
         *                           may also require.
         */
        public function __construct(
                Options $options,
                string  $short_plugin_name,
                string  $plugin_name,
                string  $plugin_slug
            ) {
            $this->short_plugin_name = $short_plugin_name;
            $this->plugin_name = $plugin_name;
            $this->plugin_slug = $plugin_slug;
            $this->plugin_prefix = str_replace('-', '_', $plugin_slug);

            $this->options = $options;

            add_action('init', array($this, 'on_initialization'));
        }

        /**
         * Method you can use to indicate if we have an API key.
         *
         * \param $have_api_key If true, then we have an API key.  If false, then we do not have an API key.
         */
        public function set_have_api_key(Boolean $have_api_key) {
            $this->have_api_key = $have_api_key;
        }

        /**
         * Method that is triggered during initialization to bolt the plug-in settings UI into WordPress.
         */
        public function on_initialization() {
            add_action('admin_menu', array($this, 'add_menu'));
            add_action('wp_ajax_inesonic_version_tracker_update_version_data' , array($this, 'update_version_data'));
            add_action('wp_ajax_inesonic_version_tracker_update_eula' , array($this, 'update_eula'));
        }

        /**
         * Method that adds the menu to the dashboard.
         */
        public function add_menu() {
            add_menu_page(
                $this->plugin_name,
                $this->short_plugin_name,
                'manage_options',
                $this->plugin_prefix,
                array($this, 'build_page'),
                plugin_dir_url(__FILE__) . 'assets/img/menu_icon.png',
                30
            );
        }

        /**
         * Method that adds scripts and styles to the admin page.
         */
        public function enqueue_scripts() {
            wp_enqueue_script('jquery');
            wp_enqueue_script(
                'inesonic-version-tracker-settings-page',
                \Inesonic\VersionTracker\javascript_url('settings-page'),
                array('jquery'),
                null,
                true
            );
            wp_localize_script(
                'inesonic-version-tracker-settings-page',
                'ajax_object',
                array(
                    'ajax_url' => admin_url('admin-ajax.php')
                )
            );

            wp_enqueue_style(
                'inesonic-version-tracker-styles',
                \Inesonic\VersionTracker\css_url('inesonic-version-tracker-styles'),
                array(),
                null
            );
        }

        /**
         * Method that renders the site monitoring page.
         */
        public function build_page() {
            $this->enqueue_scripts();

            $platforms = $this->options->supported_platforms();
            $eula_version = $this->options->eula_version();
            $eula_text = $this->options->eula_text();

            echo '<div class="inesonic-version-tracker-page-title"><h1 class="inesonic-version-tracker-header">' .
                   __("Software Version Tracker", 'inesonic-version-tracker') .
                 '</h1></div>' .
                 '<div class="inesonic-version-tracker-section">' .
                   '<div class="inesonic-version-tracker-section-title">' .
                     '<h2 class="inesonic-version-tracker-subheader">' .
                       __('Version Data', 'inesonic-version-tracker') .
                     '</h2>' .
                   '</div>' .
                   '<div class="inesonic-version-tracker-version-table-area">' .
                     '<table class="inesonic-version-tracker-version-table">' .
                       '<thead class="inesonic-version-tracker-version-table-header">' .
                         '<tr class="inesonic-version-tracker-version-table-header-row">' .
                           '<td class="inesonic-version-tracker-version-table-header-platform-id">' .
                             __('Platform ID', 'inesonic-version-tracker') .
                           '</td>' .
                           '<td class="inesonic-version-tracker-version-table-header-platform-name">' .
                             __('Platform Name', 'inesonic-version-tracker') .
                           '</td>' .
                           '<td class="inesonic-version-tracker-version-table-header-version">' .
                             __('Version', 'inesonic-version-tracker') .
                           '</td>' .
                           '<td class="inesonic-version-tracker-version-table-header-download-url">' .
                             __('Installer Download URL', 'inesonic-version-tracker') .
                           '</td>' .
                           '<td class="inesonic-version-tracker-version-table-header-shasum">' .
                             __('SHA-256 Checksum', 'inesonic-version-tracker') .
                           '</td>' .
                           '<td class="inesonic-version-tracker-version-table-header-payload-url">' .
                             __('Payload URL', 'inesonic-version-tracker') .
                           '</td>' .
                         '</tr>' .
                       '</thead>' .
                       '<tbody id="inesonic-version-tracker-version-table-body" ' .
                              'class="inesonic-version-tracker-version-table-body"' .
                       '>';

            $row_index = 0;
            foreach($platforms as $platform) {
                $name = $this->options->platform_name($platform);
                $version = $this->options->platform_version($platform);
                $download_url = $this->options->download_url($platform);
                $shasum = $this->options->shasum($platform);
                $payload_url = $this->options->payload_url($platform);

                echo self::version_table_row(
                    $row_index,
                    $platform,
                    $name,
                    $version,
                    $download_url,
                    $shasum,
                    $payload_url
                );

                ++$row_index;
            }

            echo self::version_table_row($row_index, '', '', '', '', '', '');

            echo       '</tbody>' .
                     '</table>' .
                   '</div>' .
                   '<div class="inesonic-version-tracker-button-area">' .
                     '<a id="inesonic-version-tracker-update-version-table-button" class="button">' .
                       __('Update Version Data', 'inesonic-version-tracker') .
                     '</a>' .
                   '</div>' .
                 '</div>' .
                 '<div class="inesonic-version-tracker-section">' .
                   '<div class="inesonic-version-tracker-section-title">' .
                     '<h2 class="inesonic-version-tracker-subheader">' .
                       __('EULA Text', 'inesonic-version-tracker') .
                     '</h2>' .
                   '</div>' .
                   '<div class="inesonic-version-tracker-eula-version-area">' .
                     '<label class="inesonic-version-tracker-eula-version-label">' .
                       __('Version ', 'inesonic-version-tracker') .
                       '<input type="text" ' .
                              'id="inesonic-version-tracker-eula-version-input" '.
                              'class="inesonic-version-tracker-eula-version-input" ' .
                              'value="' . esc_html($eula_version) . '"' .
                       '/>' .
                     '</label>' .
                   '</div>' .
                   '<div class="inesonic-version-tracker-eula-text-area">' .
                     '<textarea name="eula-text" ' .
                               'id="inesonic-version-tracker-eula-text-input" ' .
                               'class="inesonic-version-tracker-eula-text-input"' .
                     '>' .
                       esc_html($eula_text) .
                     '</textarea>' .
                   '</div>' .
                   '<div class="inesonic-version-tracker-button-area">' .
                     '<a id="inesonic-version-tracker-update-eula-button" class="button">' .
                       __('Update EULA', 'inesonic-version-tracker') .
                     '</a>' .
                   '</div>' .
                 '</div>';
        }

        /**
         * Method that creates a version table row.
         *
         * \param[in] $row_index    The row index used to access fields by ID.
         *
         * \param[in] $platform     The textual name of the platform.
         *
         * \param[in] $name         The pretty name for the platform.  This value will be displayed in user readable
         *                          forms.
         *
         * \param[in] $version      The platform specific version number.
         *
         * \param[in] $download_url The platform installer download URL.
         *
         * \param[in] $shasum       The SHA-256 checksum to display.
         *
         * \param[in] $payload_url  The payload URL for the platform.
         *
         * \return Returns the row data for the table row.
         */
        static private function version_table_row(
                int    $row_index,
                string $platform,
                string $name,
                string $version,
                string $download_url,
                string $shasum,
                string $payload_url
            ) {
            return '<tr class="inesonic-version-tracker-version-table-row">' .
                     '<td class="inesonic-version-tracker-version-table-platform-id-data">' .
                       '<input type="text" ' .
                              'id="inesonic-version-tracker-platform-id-' . $row_index . '" ' .
                              'class="inesonic-version-tracker-platform-id-input" ' .
                              'value="' . esc_html($platform) . '"' .
                       '/>' .
                     '</td>' .
                     '<td class="inesonic-version-tracker-version-table-platform-name-data">' .
                       '<input type="text" ' .
                              'id="inesonic-version-tracker-platform-name-' . $row_index . '" ' .
                              'class="inesonic-version-tracker-platform-name-input" ' .
                              'value="' . esc_html($name) . '"' .
                       '/>' .
                     '</td>' .
                     '<td class="inesonic-version-tracker-version-table-version-data">' .
                       '<input type="text" ' .
                              'id="inesonic-version-tracker-version-' . $row_index . '" ' .
                              'class="inesonic-version-tracker-version-input" ' .
                              'value="' . esc_html($version) . '"' .
                       '/>' .
                     '</td>' .
                     '<td class="inesonic-version-tracker-version-table-download-url-data">' .
                       '<input type="text" ' .
                              'id="inesonic-version-tracker-download-url-' . $row_index . '" ' .
                              'class="inesonic-version-tracker-download-url-input" ' .
                              'value="' . esc_html($download_url) . '"' .
                       '/>' .
                     '</td>' .
                     '<td class="inesonic-version-tracker-version-table-shasum-data">' .
                       '<input type="text" ' .
                              'id="inesonic-version-tracker-shasum-' . $row_index . '" ' .
                              'class="inesonic-version-tracker-shasum-input" ' .
                              'value="' . esc_html($shasum) . '"' .
                       '/>' .
                     '</td>' .
                     '<td class="inesonic-version-tracker-version-table-payload-url-data">' .
                       '<input type="text" ' .
                              'id="inesonic-version-tracker-payload-url-' . $row_index . '" ' .
                              'class="inesonic-version-tracker-payload-url-input" ' .
                              'value="' . esc_html($payload_url) . '"' .
                       '/>' .
                     '</td>' .
                   '</tr>';
        }

        /**
         * Method that is triggered by AJAX to update version data.
         */
        public function update_version_data() {
            if (current_user_can('activate_plugins')) {
                if (array_key_exists('data', $_POST)) {
                    $version_data = $_POST['data'];
                    $new_supported_platforms = array();
                    $old_supported_platforms = $this->options->supported_platforms();

                    foreach ($version_data as $platform => $platform_data) {
                        $pl = sanitize_text_field($platform);
                        $name = sanitize_text_field($platform_data['name']);
                        $version = sanitize_text_field($platform_data['version']);
                        $download_url = sanitize_text_field($platform_data['download_url']);
                        $shasum = sanitize_text_field($platform_data['shasum']);
                        $payload_url = sanitize_text_field($platform_data['payload_url']);

                        $this->options->set_platform_name($pl, $name);
                        $this->options->set_platform_version($pl, $version);
                        $this->options->set_download_url($pl, $download_url);
                        $this->options->set_shasum($pl, $shasum);
                        $this->options->set_payload_url($pl, $payload_url);

                        $new_supported_platforms[] = $pl;
                    }

                    foreach ($old_supported_platforms as $platform) {
                        if (!in_array($pl, $new_supported_platforms)) {
                            $this->options->set_platform_version($pl, "");
                            $this->options->set_download_url($pl, "");
                            $this->options->set_shasum($pl, "");
                            $this->options->set_payload_url($pl, "");
                        }
                    }

                    $this->options->set_supported_platforms($new_supported_platforms);
                    $status = 'OK';
                } else {
                    $status = 'invalid message';
                }
            } else {
                $status = 'insufficient permissions';
            }

            echo json_encode(array('status' => $status));
            wp_die();
        }

        /**
         * Method that is triggered by AJAX to update the EULA.
         */
        public function update_eula() {
            if (current_user_can('activate_plugins')) {
                if (array_key_exists('version', $_POST) && array_key_exists('text', $_POST)) {
                    $version = sanitize_text_field($_POST['version']);
                    $text = $_POST['text']; // Need to keep all HTML tags -- do not escape.

                    $this->options->set_eula_version($version);
                    $this->options->set_eula_text($text);

                    $status = 'OK';
                } else {
                    $status = 'invalid message';
                }
            } else {
                $status = 'insufficient permissions';
            }

            echo json_encode(array('status' => $status));
            wp_die();
        }
    };
