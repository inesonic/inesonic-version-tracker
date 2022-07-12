========================
inesonic-version-tracker
========================
You can use this WordPress plugin to track and manage software download
information.  The plugin provides the following features:

* Tracking on software versions, installer download URL, SHA-256 checksum and
  an optional "payload URL" on a per-platform basis.  The payload URL is
  provided to support installers that do not include an actual software install
  image and must either request the software throught a REST API or must
  download the image separately.
* Tracks EULA text content and EULA version for software.  Updating a software
  EULA is as simple as pasting the new EULA content, in HTML format into the
  supplied text entry area.
* Plugin provides shortcodes allowing you to display the software version,
  download URL, and SHA-256 checksum on a per-platform basis.
* Plugin provides shortcodes to display EULA text and EULA version.
* REST API to query software version information by platform, including the
  optional payload URL.
* REST API to query the current EULA version and EULA text.

To use, simply copy this entire directory into your WordPress plugins directory
and then activate the plugin from the WordPress admin panel.

Once activated, can adjust the settings using the "Version Tracker" menu option
displayed on the left side of the WordPress Admin panel.

.. note::

   This plugin is still in-work.  Additional shortcodes and features will be
   added shortly.


Shortcodes
==========
This plugin supports the following shortcodes:

+-----------------------------------------+-----------------------------------+
| Shortcode                               | Provides                          |
+=========================================+===================================+
| [inesonic_eula_version]                 | Shortcode that inserts the EULA   |
|                                         | version into a post or page.      |
+-----------------------------------------+-----------------------------------+
| [inesonic_eula_text]                    | Shortcode that inserts the EULA   |
|                                         | text into a post or page.         |
+-----------------------------------------+-----------------------------------+
| [inesonic_release_version platform=xxx] | Shortcode that inserts the        |
|                                         | software release version for a    |
|                                         | specific platform into a post or  |
|                                         | page.                             |
+-----------------------------------------+-----------------------------------+
| [inesonic_download_url platform=xxx]    | Shortcode that inserts the        |
|                                         | download URL into a post or page. |
+-----------------------------------------+-----------------------------------+
| [inesonic_shasum platform=xxx]          | Shortcode that inserts the        |
|                                         | SHA-256 checksum into a post or   |
|                                         | page.                             |
+-----------------------------------------+-----------------------------------+


REST API
========
You can use one of two supplied REST APIs to have your installer interact with
this plugin.


/wp-json/inesonic/v1/eula/
--------------------------
Querying this API via an HTTP POST method will return a JSON encoded dictionary
containing the EULA version ('version') followed by the EULA text ('text').  A
simple example returned payload might be:

.. code-block:: json

   {
       "version" : "1.0",
       "text" : "All rights reserved, Whizz-Bang Corporation"
   }


/wp-json/inesonic/v1/version/
-----------------------------
Querying this API via an HTTP POST method will return a JSON encoded dictionary
containing software version information by platform.  The dictionary will
contains keys indicating the platform.  For each platform, the endpoint will
return a dictionary containing:

* The ``version``.
* The ``download_url``.
* The ``shasum``, and
* The ``payload_url``.

An example dictionary is shown below:

.. code-block:: json

   {
       "windows" : {
           "version" : "1e",
           "download_url" : "https://mysite.com/installers/windows.exe",
           "shasum" : "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
           "payload_url" : "https://installer.mysite.com/v1/windows/"
        },
       "linux" : {
           "version" : "1e",
           "download_url" : "https://mysite.com/installers/linux.sh",
           "shasum" : "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210".
           "payload_url" : "https://installer.mysite.com/v1/linux/"
        },
       "beos" : {
           "version" : "1e",
           "download_url" : "https://mysite.com/installers/beos.sh",
           "shasum" : "efcdab8967452301efcdab8967452301efcdab8967452301efcdab8967452301",
           "payload_url" : "https://installer.mysite.com/v1/beos/"
        }
   }
