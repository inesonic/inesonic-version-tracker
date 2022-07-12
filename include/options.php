<?php
/***********************************************************************************************************************
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
    /**
     * Trivial class that provides an API to plug-in specific options.
     */
    class Options {
        /**
         * Static method that is triggered when the plug-in is activated.
         */
        public function plugin_activated() {}

        /**
         * Static method that is triggered when the plug-in is deactivated.
         */
        public function plugin_deactivated() {}

        /**
         * Static method that is triggered when the plug-in is uninstalled.
         */
        public function plugin_uninstalled() {
            $this->delete_option('template_directory');
            $this->delete_option('transitions');
            $this->delete_option('events');
        }

        /**
         * Constructor
         *
         * \param[in] $options_prefix The options prefix to apply to plug-in specific options.
         */
        public function __construct(string $options_prefix) {
            $this->options_prefix = $options_prefix . '_';
        }

        /**
         * Method you can use to obtain the current plugin version.
         *
         * \return Returns the current plugin version.  Returns null if the version has not been set.
         */
        public function version() {
            return $this->get_option('version', null);
        }

        /**
         * Method you can use to set the current plugin version.
         *
         * \param $version The desired plugin version.
         *
         * \return Returns true on success.  Returns false on error.
         */
        public function set_version(string $version) {
            return $this->update_option('version', $version);
        }

        /**
         * Method you can use to obtain a list of supported platforms.
         *
         * \return Returns an array of supported platform names.
         */
        public function supported_platforms() {
            return json_decode($this->get_option('supported_platforms', '[]'));
        }

        /**
         * Method you can use to set the list of supported platforms.
         *
         * \param[in] $supported_platforms The new list of supported platforms.
         */
        public function set_supported_platforms(array $supported_platforms) {
            $this->update_option('supported_platforms', json_encode($supported_platforms));
        }

        /**
         * Method you can use to get the platform version for a platform.
         *
         * \param[in] $platform The platform to get the platform version for.
         *
         * \return Returns the requested platform version.
         */
        public function platform_version(string $platform) {
            $option_name = 'version_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->get_option($option_name, '');
        }

        /**
         * Method you can use to set the platform version for a platform.
         *
         * \param[in] $platform     The platform to update the platform version for.
         *
         * \param[in] $platform_version The new platform version.
         *
         * \return Returns the requested download path.
         */
        public function set_platform_version(string $platform, string $platform_version) {
            $option_name = 'version_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->update_option($option_name, $platform_version);
        }

        /**
         * Method you can use to get the download URL for a platform.
         *
         * \param[in] $platform The platform to get the download URL for.
         *
         * \return Returns the requested download URL.
         */
        public function download_url(string $platform) {
            $option_name = 'download_url_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->get_option($option_name, '');
        }

        /**
         * Method you can use to set the download URL for a platform.
         *
         * \param[in] $platform     The platform to update the download URL for.
         *
         * \param[in] $download_url The new download URL.
         *
         * \return Returns the requested download path.
         */
        public function set_download_url(string $platform, string $download_url) {
            $option_name = 'download_url_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->update_option($option_name, $download_url);
        }

        /**
         * Method you can use to get the SHA-256 sum for a platform.
         *
         * \param[in] $platform The platform to get the SHA-256 sum for.
         *
         * \return Returns the requested SHA-256 sum.
         */
        public function shasum(string $platform) {
            $option_name = 'shasum_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->get_option($option_name, '');
        }

        /**
         * Method you can use to set the SHA-256 sum for a platform.
         *
         * \param[in] $platform     The platform to update the SHA-256 sum for.
         *
         * \param[in] $shasum The new SHA-256 sum.
         *
         * \return Returns the requested download path.
         */
        public function set_shasum(string $platform, string $shasum) {
            $option_name = 'shasum_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->update_option($option_name, $shasum);
        }

        /**
         * Method you can use to get the payload URL for a platform.
         *
         * \param[in] $platform The platform to get the payload URL for.
         *
         * \return Returns the requested payload URL.
         */
        public function payload_url(string $platform) {
            $option_name = 'payload_url_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->get_option($option_name, '');
        }

        /**
         * Method you can use to set the payload URL for a platform.
         *
         * \param[in] $platform     The platform to update the payload URL for.
         *
         * \param[in] $payload_url The new payload URL.
         *
         * \return Returns the requested payload path.
         */
        public function set_payload_url(string $platform, string $payload_url) {
            $option_name = 'payload_url_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->update_option($option_name, $payload_url);
        }

        /**
         * Method you can use to get the software version for a platform.
         *
         * \param[in] $platform The platform to get the software version for.
         *
         * \return Returns the requested software version.
         */
        public function software_version(string $platform) {
            $option_name = 'software_version_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->get_option($option_name, '');
        }

        /**
         * Method you can use to set the software version for a platform.
         *
         * \param[in] $platform         The platform to update the software version for.
         *
         * \param[in] $software_version The new software version.
         */
        public function set_software_version(string $platform, string $software_version) {
            $option_name = 'software_version_' . preg_replace('/[^a-z0-9]/', '_', strtolower($platform));
            return $this->update_option($option_name, $software_version);
        }

        /**
         * Method you can use to obtain the current software EULA version.
         *
         * \return Returns the current software EULA.
         */
        public function eula_version() {
            return $this->get_option('eula_version', null);
        }

        /**
         * Method you can use to change the current software EULA version.
         *
         * \param[in] $new_eula_version The new EULA version.
         */
        public function set_eula_version(string $new_eula_version) {
            $this->update_option('eula_version', $new_eula_version);
        }

        /**
         * Method you can use to obtain the current software EULA text.
         *
         * \return Returns the current software EULA.
         */
        public function eula_text() {
            return $this->get_option('eula_text', null);
        }

        /**
         * Method you can use to change the current software EULA text.
         *
         * \param[in] $new_eula_text The new EULA text.
         */
        public function set_eula_text(string $new_eula_text) {
            $this->update_option('eula_text', $new_eula_text);
        }

        /**
         * Method you can use to obtain a specific option.  This function is a thin wrapper on the WordPress get_option
         * function.
         *
         * \param $option  The name of the option of interest.
         *
         * \param $default The default value.
         *
         * \return Returns the option content.  A value of false is returned if the option value has not been set and
         *         the default value is not provided.
         */
        private function get_option(string $option, $default = false) {
            return \get_option($this->options_prefix . $option, $default);
        }

        /**
         * Method you can use to add a specific option.  This function is a thin wrapper on the WordPress update_option
         * function.
         *
         * \param $option The name of the option of interest.
         *
         * \param $value  The value to assign to the option.  The value must be serializable or scalar.
         *
         * \return Returns true on success.  Returns false on error.
         */
        private function update_option(string $option, $value = '') {
            return \update_option($this->options_prefix . $option, $value);
        }

        /**
         * Method you can use to delete a specific option.  This function is a thin wrapper on the WordPress
         * delete_option function.
         *
         * \param $option The name of the option of interest.
         *
         * \return Returns true on success.  Returns false on error.
         */
        private function delete_option(string $option) {
            return \delete_option($this->options_prefix . $option);
        }
    }
