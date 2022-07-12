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
 * \file settings-page.js
 *
 * JavaScript module that manages the version tracker settings page.
 */

/***********************************************************************************************************************
 * Script scope locals:
 */

/**
 * Regular expression used to check a URL.
 *
 * The regular expression below was kindly taken from https://gist.github.com/dperini/729294 and used under the terms
 * of the MIT license.  Credit for the regular expression should go to Diego Perini.
 */
let webUrlRegex = new RegExp(
  "^"
    // protocol identifier (optional)
    // short syntax // still required
    "(?:(?:(?:https?|ftp):)?\\/\\/)"
    // user:pass BasicAuth (optional)
    "(?:\\S+(?::\\S*)?@)?"
    "(?:"
      // IP address exclusion
      // private & local networks
      "(?!(?:10|127)(?:\\.\\d{1,3}){3})"
      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})"
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})"
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broadcast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])"
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}"
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))"
    "|"
      // host & domain names, may end with dot
      // can be replaced by a shortest alternative
      // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
      "(?:"
        "(?:"
          "[a-z0-9\\u00a1-\\uffff]"
          "[a-z0-9\\u00a1-\\uffff_-]{0,62}"
        ")?"
        "[a-z0-9\\u00a1-\\uffff]\\."
      ")+"
      // TLD identifier name, may end with dot
      "(?:[a-z\\u00a1-\\uffff]{2,}\\.?)"
    ")"
    // port number (optional)
    "(?::\\d{2,5})?"
    // resource path (optional)
    "(?:[/?#]\\S*)?"
  "$", "i"
);

/**
 * Regular expression used to check a SHA-256 checksum.
 */
let sha256ChecksumRegex = new RegExp("[a-zA-Z0-9]{64}");

/***********************************************************************************************************************
 * Functions:
 */

/**
 * Function that checks if a URL is valid.
 *
 * \param url The URL to be checked.
 *
 * \return Returns true if the URL is valid.  Returns false if the URL is invalid.
 */
function inesonicIsValidUrl(url) {
    return webUrlRegex.test(url);
}

/**
 * Function that checks if a SHA-256 checksum is valid.
 *
 * \param checksum The checksum to be verified.
 *
 * \return Returns true if the checksum is valid.  Returns false if the checksumis invalid.
 */
function inesonicIsValidChecksum(url) {
    return sha256ChecksumRegex.test(url);
}

/**
 * Function that determines the current number of platform rows.
 *
 * \return Returns the current number of platform rows.
 */
function inesonicNumberPlatformRows() {
    let versionTableBody = document.getElementById("inesonic-version-tracker-version-table-body");
    return versionTableBody.childElementCount;
}

/**
 * Function that determines the row index based on an input field ID.
 *
 * \param[in] id The ID of the input field.
 *
 * \return Returns the row index.
 */
function inesonicGetRowIndex(id) {
    fields = id.split("-");
    return Number(fields[fields.length - 1]);
}

/**
 * Function that checks if we can enable the version update button.
 */
function inesonicCheckIfVersionUpdateAllowed() {
    let numberRows    = inesonicNumberPlatformRows();
    let updateAllowed = true;
    let nonEmptyRows  = false;

    for (let rowIndex=0 ; rowIndex<numberRows ; ++rowIndex) {
        let platform = jQuery("#inesonic-version-tracker-platform-" + rowIndex).val().trim();
        let version = jQuery("#inesonic-version-tracker-version-" + rowIndex).val().trim();
        let downloadUrl = jQuery("#inesonic-version-tracker-download-url-" + rowIndex).val().trim();
        let shasum = jQuery("#inesonic-version-tracker-shasum-" + rowIndex).val().trim();
        let payloadUrl = jQuery("#inesonic-version-tracker-payload-url-" + rowIndex).val().trim();

        if (payloadUrl || shasum || downloadUrl || version || platform) {
            nonEmptyRows = true;
            updateAllowed = (
                   updateAllowed
                && version
                && platform
                && inesonicIsValidUrl(downloadUrl)
                && inesonicIsValidChecksum(shasum)
                && (!payloadUrl || inesonicIsValidUrl(payloadUrl))
            );
        }
    }

    if (nonEmptyRows && !updateAllowed) {
        jQuery("#inesonic-version-tracker-update-version-table-button").addClass("inesonic-disable-click");
    } else {
        jQuery("#inesonic-version-tracker-update-version-table-button").removeClass("inesonic-disable-click");
    }
}


/**
 * Function that validates a version row.
 *
 * \param[in] rowIndex The row index of the row to be checked.
 */
function inesonicValidateRow(rowIndex) {
    if ((rowIndex + 1) >= inesonicNumberPlatformRows()) {
        inesonicAppendVersionRow("", "", "", "", "");
    }

    let platform = jQuery("#inesonic-version-tracker-platform-" + rowIndex).val().trim();
    let version = jQuery("#inesonic-version-tracker-version-" + rowIndex).val().trim();
    let downloadUrl = jQuery("#inesonic-version-tracker-download-url-" + rowIndex).val().trim();
    let shasum = jQuery("#inesonic-version-tracker-shasum-" + rowIndex).val().trim();
    let payloadUrl = jQuery("#inesonic-version-tracker-payload-url-" + rowIndex).val().trim();

    if (!payloadUrl && !shasum && !downloadUrl && !version && !platform) {
        jQuery("#inesonic-version-tracker-platform-" + rowIndex).removeClass("inesonic-bad-entry");
        jQuery("#inesonic-version-tracker-version-" + rowIndex).removeClass("inesonic-bad-entry");
        jQuery("#inesonic-version-tracker-download-url-" + rowIndex).removeClass("inesonic-bad-entry");
        jQuery("#inesonic-version-tracker-shasum-" + rowIndex).removeClass("inesonic-bad-entry");
        jQuery("#inesonic-version-tracker-payload-url-" + rowIndex).removeClass("inesonic-bad-entry");
    } else {
        if (platform) {
            jQuery("#inesonic-version-tracker-platform-" + rowIndex).removeClass("inesonic-bad-entry");
        } else {
            jQuery("#inesonic-version-tracker-platform-" + rowIndex).addClass("inesonic-bad-entry");
        }

        if (version) {
            jQuery("#inesonic-version-tracker-version-" + rowIndex).removeClass("inesonic-bad-entry");
        } else {
            jQuery("#inesonic-version-tracker-version-" + rowIndex).addClass("inesonic-bad-entry");
        }

        if (inesonicIsValidUrl(downloadUrl)) {
            jQuery("#inesonic-version-tracker-download-url-" + rowIndex).removeClass("inesonic-bad-entry");
        } else {
            jQuery("#inesonic-version-tracker-download-url-" + rowIndex).addClass("inesonic-bad-entry");
        }

        if (inesonicIsValidChecksum(shasum)) {
            jQuery("#inesonic-version-tracker-shasum-" + rowIndex).removeClass("inesonic-bad-entry");
        } else {
            jQuery("#inesonic-version-tracker-shasum-" + rowIndex).addClass("inesonic-bad-entry");
        }

        if (!payloadUrl || inesonicIsValidUrl(payloadUrl)) {
            jQuery("#inesonic-version-tracker-payload-url-" + rowIndex).removeClass("inesonic-bad-entry");
        } else {
            jQuery("#inesonic-version-tracker-payload-url-" + rowIndex).addClass("inesonic-bad-entry");
        }
    }

    inesonicCheckIfVersionUpdateAllowed();
}

/**
 * Function that is triggered when the platform text changes.
 *
 * \param[in] event The event that triggered the call to this function.
 */
function inesonicPlatformTextChanged(event) {
    let rowIndex = inesonicGetRowIndex(event.target.id);
    inesonicValidateRow(rowIndex);
}

/**
 * Function that is triggered when the version text changes.
 *
 * \param[in] event The event that triggered the call to this function.
 */
function inesonicVersionTextChanged(event) {
    let rowIndex = inesonicGetRowIndex(event.target.id);
    inesonicValidateRow(rowIndex);
}

/**
 * Function that is triggered when the download URL changes.
 *
 * \param[in] event The event that triggered the call to this function.
 */
function inesonicDownloadUrlChanged(event) {
    let rowIndex = inesonicGetRowIndex(event.target.id);
    inesonicValidateRow(rowIndex);
}

/**
 * Function that is triggered when the SHA-256 checksum changes.
 *
 * \param[in] event The event that triggered the call to this function.
 */
function inesonicShasumChanged(event) {
    let rowIndex = inesonicGetRowIndex(event.target.id);
    inesonicValidateRow(rowIndex);
}

/**
 * Function that is triggered when the payload URL changes.
 *
 * \param[in] event The event that triggered the call to this function.
 */
function inesonicPayloadUrlChanged(event) {
    let rowIndex = inesonicGetRowIndex(event.target.id);
    inesonicValidateRow(rowIndex);
}

/**
 * Function that creates a version table data field.
 *
 * \param[in] areaClass  The table data class.
 *
 * \param[in] inputId    The ID for the input field.
 *
 * \param[in] inputClass The input field class.
 *
 * \param[in] inputValue The input value to be placed into the field.
 *
 * \return Returns the table data element to be inserted.
 */
function inesonicCreateVersionTableData(areaClass, inputId, inputClass, inputValue) {
    let dataArea = document.createElement("td");
    dataArea.className = areaClass;

    let inputField = document.createElement("input");
    inputField.type = "text";
    inputField.className = inputClass;
    inputField.id = inputId;
    inputField.value = inputValue;

    dataArea.appendChild(inputField);

    return dataArea;
}

/**
 * Function that binds events to a single version table row.
 *
 * \param[in] rowIndex The zero based row index to bind to.
 */
function inesonicBindEventsToVersionTableRow(rowIndex) {
    jQuery("#inesonic-version-tracker-platform-" + rowIndex).on("keyup change paste", inesonicPlatformTextChanged);
    jQuery("#inesonic-version-tracker-version-" + rowIndex).on("keyup change paste", inesonicVersionTextChanged);
    jQuery("#inesonic-version-tracker-download-url-" + rowIndex).on("keyup change paste", inesonicDownloadUrlChanged);
    jQuery("#inesonic-version-tracker-shasum-" + rowIndex).on("keyup change paste", inesonicShasumChanged);
    jQuery("#inesonic-version-tracker-payload-url-" + rowIndex).on("keyup change paste", inesonicPayloadUrlChanged);
}

/**
 * Function that appends a row to the versioning table.
 *
 * \param[in] platform    The textual name of the platform.
 *
 * \param[in] version     The platform specific version number.
 *
 * \param[in] downloadUrl The platform installer download URL.
 *
 * \param[in] shasum      The SHA-256 checksum for the download.
 *
 * \param[in] payloadUrl  The payload URL for the platform.
 */
function inesonicAppendVersionRow(platform, version, downloadUrl, shasum, payloadUrl) {
    let versionTableBody = document.getElementById("inesonic-version-tracker-version-table-body");
    let rowIndex = versionTableBody.childElementCount;

    let tableRow = document.createElement("tr");
    tableRow.className = "inesonic-version-tracker-version-table-row";

    tableRow.appendChild(
        inesonicCreateVersionTableData(
            "inesonic-version-tracker-version-table-platform-data",
            "inesonic-version-tracker-platform-" + rowIndex,
            "inesonic-version-tracker-platform-input",
            platform
        )
    );

    tableRow.appendChild(
        inesonicCreateVersionTableData(
            "inesonic-version-tracker-version-table-version-data",
            "inesonic-version-tracker-version-" + rowIndex,
            "inesonic-version-tracker-version-input",
            version
        )
    );

    tableRow.appendChild(
        inesonicCreateVersionTableData(
            "inesonic-version-tracker-version-table-download-url-data",
            "inesonic-version-tracker-download-url-" + rowIndex,
            "inesonic-version-tracker-download-url-input",
            downloadUrl
        )
    );

    tableRow.appendChild(
        inesonicCreateVersionTableData(
            "inesonic-version-tracker-version-table-shasum-data",
            "inesonic-version-tracker-shasum-" + rowIndex,
            "inesonic-version-tracker-shasum-input",
            shasum
        )
    );

    tableRow.appendChild(
        inesonicCreateVersionTableData(
            "inesonic-version-tracker-version-table-payload-url-data",
            "inesonic-version-tracker-payload-url-" + rowIndex,
            "inesonic-version-tracker-payload-url-input",
            payloadUrl
        )
    );

    versionTableBody.appendChild(tableRow);

    inesonicBindEventsToVersionTableRow(rowIndex);
}

/**
 * Function that binds key changes to elements.
 */
function inesonicBindEventHandlers() {
    let numberPlatformRows = inesonicNumberPlatformRows();

    for (let i=0 ; i<numberPlatformRows ; ++i) {
        inesonicBindEventsToVersionTableRow(i);
    }
}

/**
 * Function that is triggered to update the mailer settings.
 */
function inesonicMailerConfigureSettingsSubmit() {
    let templateDirectory = jQuery("#inesonic-mailer-template-directory").val();
    let transitions = jQuery("#inesonic-mailer-transitions").val();
    let events = jQuery("#inesonic-mailer-events").val();

    jQuery.ajax(
        {
            type: "POST",
            url: ajax_object.ajax_url,
            data: {
                "action" : "inesonic_mailer_update_settings",
                "template_directory" : templateDirectory,
                "transitions" : transitions,
                "events" : events
            },
            dataType: "json",
            success: function(response) {
                if (response !== null) {
                    if (response.status == 'OK') {
                        inesonicMailerToggleConfiguration();
                    } else {
                        alert("Failed to update Mailer settings\n" + response.status);
                    }
                } else {
                    alert("Failed to update Mailer API key.");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Could not update configuration: " + errorThrown);
            }
        }
    );
}

/**
 * Function that is triggered to update the software version data.
 */
function inesonicUpdateVersionData() {
    let numberRows = inesonicNumberPlatformRows();
    let versionData = {}
    for (let rowIndex=0 ; rowIndex<numberRows ; ++rowIndex) {
        let platform = jQuery("#inesonic-version-tracker-platform-" + rowIndex).val().trim();
        let version = jQuery("#inesonic-version-tracker-version-" + rowIndex).val().trim();
        let downloadUrl = jQuery("#inesonic-version-tracker-download-url-" + rowIndex).val().trim();
        let shasum = jQuery("#inesonic-version-tracker-shasum-" + rowIndex).val().trim();
        let payloadUrl = jQuery("#inesonic-version-tracker-payload-url-" + rowIndex).val().trim();

        if (platform && version && downloadUrl && shasum) {
            versionData[platform] = {
                "version" : version,
                "download_url" : downloadUrl,
                "shasum" : shasum,
                "payload_url" : payloadUrl
            }
        }
    }

    jQuery.ajax(
        {
            type: "POST",
            url: ajax_object.ajax_url,
            data: {
                "action" : "inesonic_version_tracker_update_version_data",
                "data" : versionData
            },
            dataType: "json",
            success: function(response) {
                if (response !== null) {
                    if (response.status != 'OK') {
                        alert("Failed to update version data: " + response.status);
                    }
                } else {
                    alert("Failed to update version data.");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("Failed to update version data: " + errorThrown);
            }
        }
    );
}

/**
 * Function that conditionally enables the EULA update button.
 */
function inesonicCheckEulaUpdateAllowed() {
    let eulaVersion = jQuery("#inesonic-version-tracker-eula-version-input").val().trim();
    let eulaText = jQuery("#inesonic-version-tracker-eula-text-input").val().trim();

    if (eulaVersion && eulaText) {
        jQuery("#inesonic-version-tracker-update-eula-button").removeClass("inesonic-disable-click");
    } else {
        jQuery("#inesonic-version-tracker-update-eula-button").addClass("inesonic-disable-click");
    }
}

/**
 * Function that is triggered when the EULA version changes.
 *
 * \param[in] event The event that triggered this function.
 */
function inesonicEulaVersionChanged(event) {
    let versionText = event.target.value.trim();
    if (versionText) {
        jQuery("#inesonic-version-tracker-eula-version-input").removeClass("inesonic-bad-entry");
        inesonicCheckEulaUpdateAllowed();
    } else {
        jQuery("#inesonic-version-tracker-eula-version-input").addClass("inesonic-bad-entry");
        jQuery("#inesonic-version-tracker-update-eula-button").addClass("inesonic-disable-click");
    }
}

/**
 * Function that is triggered when the EULA text changes.
 *
 * \param[in] event The event that triggered this function.
 */
function inesonicEulaTextChanged(event) {
    let versionText = event.target.value.trim();
    if (versionText) {
        jQuery("#inesonic-version-tracker-eula-text-input").removeClass("inesonic-bad-entry");
        inesonicCheckEulaUpdateAllowed();
    } else {
        jQuery("#inesonic-version-tracker-eula-text-input").addClass("inesonic-bad-entry");
        jQuery("#inesonic-version-tracker-update-eula-button").addClass("inesonic-disable-click");
    }
}

/**
 * Function that is triggered to update the software EULA.
 */
function inesonicUpdateEula() {
    let eulaVersion = jQuery("#inesonic-version-tracker-eula-version-input").val().trim();
    let eulaText = jQuery("#inesonic-version-tracker-eula-text-input").val().trim();

    jQuery.ajax(
        {
            type: "POST",
            url: ajax_object.ajax_url,
            data: {
                "action" : "inesonic_version_tracker_update_eula",
                "version" : eulaVersion,
                "text" : eulaText
            },
            dataType: "json",
            success: function(response) {
                if (response !== null) {
                    if (response.status != 'OK') {
                        alert("Failed to update EULA: " + response.status);
                    }
                } else {
                    alert("Failed to update EULA.");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("Failed to update EULA: " + errorThrown);
            }
        }
    );
}

/***********************************************************************************************************************
 * Main:
 */

jQuery(document).ready(function($) {
    inesonicBindEventHandlers();

    $("#inesonic-version-tracker-eula-version-input").on("keyup change paste", inesonicEulaVersionChanged);
    $("#inesonic-version-tracker-eula-text-input").on("keyup change paste", inesonicEulaTextChanged);

    $("#inesonic-version-tracker-update-version-table-button").click(inesonicUpdateVersionData);
    $("#inesonic-version-tracker-update-eula-button").click(inesonicUpdateEula);
});
