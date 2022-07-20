========================
inesonic-version-tracker
========================
You can use this WordPress plugin to track and manage software download
information.  The plugin provides the following features:

* Tracking on software versions, OS/platform names, installer download URL,
  SHA-256 checksum and an optional "payload URL" on a per-platform basis.  The
  payload URL is provided to support installers that do not include an actual
  software install image and must either request the software throught a REST
  API or must download the image separately.
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
| [inesonic_download_button               | Shortcode that displays a widget  |
|   button_text="<text>"                  | containing a drop down, anchor    |
|   shasum_text="<text>"                  | and SHA-256 checksum for a        |
|   no_platform_text="<text>" ]           | download.                         |
|                                         |                                   |
|                                         | See the section below for         |
|                                         | details.                          |
+-----------------------------------------+-----------------------------------+

inesonic_download_button
------------------------
You can use this shortcode to display a download button with a selection box
and SHA-256 checksum.  The button will attempt to identify the operating system
of the host system and will match to the platform ID.

Platform IDs will be matched based whether they contain one of "windows",
"linux", "unix", or "macos".   The first platform meeting the match criteria
will be used.

Users can use the drop down to select downloads for a different operating
system or download type.

When the selected platform/operating system is changed, the displayed SHA-256
checksum will be updated to reflect the desired download.

You can update text in the widget using the "button_text", "shasum_text" and
"no_platform_text" attributes.

The "button_text" attribute sets the text for the button.  If not specified,
"Download" will be used.

The "shasum_text" attributes sets the text for the SHA-256 checksum.  If not
specified, "SHA-256 Checksum: " will be used.

The "no_platform_text" attributes sets the text for the first option in the
selection.   This option will be used if the platform could not be determined.
If not specified, "Select your operating system..." will be used.

The shortcode makes heavy uses of CSS classes.  You can use these classes to
modify the look and feel for the widget.

To see an example, visit the Inesonic home page at
`Inesonic <https://inesonic.com>`.


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

* The os/platform ``name``.
* The ``version``.
* The ``download_url``.
* The ``shasum``, and
* The ``payload_url``.

An example dictionary is shown below:

.. code-block:: json

   {
       "windows" : {
	       "name" : "Windows",
           "version" : "1e",
           "download_url" : "https://mysite.com/installers/windows.exe",
           "shasum" : "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
           "payload_url" : "https://installer.mysite.com/v1/windows/"
        },
       "linux" : {
	       "name" : "Linux (AMD64)",
           "version" : "1e",
           "download_url" : "https://mysite.com/installers/linux.sh",
           "shasum" : "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210".
           "payload_url" : "https://installer.mysite.com/v1/linux/"
        },
       "beos" : {
	       "name" : "BeOS",
           "version" : "1e",
           "download_url" : "https://mysite.com/installers/beos.sh",
           "shasum" : "efcdab8967452301efcdab8967452301efcdab8967452301efcdab8967452301",
           "payload_url" : "https://installer.mysite.com/v1/beos/"
        }
   }
