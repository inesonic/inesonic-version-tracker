 /**********************************************************************************************************************
 * Copyright 2021, Inesonic, LLC
 * All Rights Reserved
 ***********************************************************************************************************************
 * \file check-transaction-processed.js
 *
 * JavaScript module that checks if the customer has a pending transaction.
 */

/***********************************************************************************************************************
 * Parameters:
 */

const PLATFORM_DATA = platform_data;

/***********************************************************************************************************************
 * Functions:
 */

/**
 * Function that enables/disables elements by class name.
 *
 * \param className  The class name used to locate elements to be updated.
 *
 * \param nowVisible A flag holding true if elements of the class should be made visible.  A value of false will hide
 *                   the elements.
 */
function enableByClass(className, nowVisible) {
    if (nowVisible) {
        jQuery("." + className).show();
    } else {
        jQuery("." + className).hide();
    }
}

/**
 * Function that enables/disables the various controls.
 */
function enableControls() {
    enableByClass("can-purchase", canPurchase);
    enableByClass("can-upgrade", canUpgrade);
    enableByClass("can-install", canInstall);
    enableByClass("can-see-billing", canSeeBilling);

    enableByClass("active-account", canUpgrade || canInstall || canSeeBilling);

    enableByClass("sent-install-key", false);
}

/**
 * Function that converts a Unix timestamp to a localized date/time string.
 *
 * \param[in] timestamp The timestamp to convert.
 *
 * \return Returns the converted timestamp.
 */
function toDateTimeString(timestamp) {
    let result = "???";

    timestamp = Number(timestamp);
    if (timestamp) {
        let dateTime = moment.unix(timestamp);
        result = dateTime.format("LLL");
    }

    return result;
}

/**
 * Function that is triggered to update the my-account page based on account status.
 *
 * \param[in] userType     The type of user.
 *
 * \param[in] userSettings Settings tied to this user.  These settings are primarily tied to the user type.
 */
function updateAccountStatus(userType, userSettings) {
    planDescription       = userSettings.description;
    subscriptionName      = userSettings.subscription;
    isSubscription        = userSettings.is_subscription;
    responsibility        = userSettings.responsibility;
    canPurchase           = userSettings.can_purchase;
    canInstall            = userSettings.can_install;
    canTrial              = userSettings.can_trial;
    canSeeBilling         = userSettings.can_see_billing;
    canUpgrade            = userSettings.can_upgrade;
    productOwner          = userSettings.product_owner;
    maximumMembers        = userSettings.maximum_members;
    canAssignOthersTo     = userSettings.can_assign_others_to;
    allowedUserTransition = userSettings.allowed_user_transition;

    memberTypesByRole = {}
    Object.keys(canAssignOthersTo).forEach(function(k) { memberTypesByRole[canAssignOthersTo[k]] = k });

    if (canPurchase) {
        jQuery("#active-account").hide();
        jQuery("#inactive-account").show();
    } else {
        jQuery("#inactive-account").hide();
        jQuery("#active-account").show();
        jQuery("#subscription-name").text(subscriptionName);

        if (responsibility) {
            let responsibilityText = INESONIC_MESSAGES['responsibilities'][responsibility];
            jQuery("#responsibility-field").show();
            jQuery("#responsibility-text").text(responsibilityText);
        } else {
            jQuery("#responsibility-field").hide();
        }
    }

    if (canUpgrade) {
        jQuery("#upgrade-button").show();
    } else {
        jQuery("#upgrade-button").hide();
    }

    if (canInstall) {
        jQuery("#send-install-key-button").show();
    } else {
        jQuery("#send-install-key-button").hide();
    }

    if (canSeeBilling) {
        jQuery("#billing-button").show();
        jQuery("#subscription-table").show();
        jQuery("#subscription-table").width("47.25%");

        if (isSubscription) {
            jQuery("#inesonic-period-start-row").show();
            jQuery("#inesonic-period-end-row").show();
        } else {
            jQuery("#inesonic-period-start-row").hide();
            jQuery("#inesonic-period-end-row").hide();
        }

        if (canTrial) {
            jQuery("#inesonic-trial-end-row").show();
        } else {
            jQuery("#inesonic-trial-end-row").hide();
        }

        if (maximumMembers > 1 || maximumMembers < 0) {
            jQuery("#inesonic-quantity-row").show();

            if (maximumMembers > 0) {
                jQuery("#inesonic-maximum-seats-area").show();
                jQuery("#inesonic-maximum-seats").text(maximumMembers);
            } else {
                jQuery("#inesonic-maximum-seats-area").hide();
            }
        } else {
            jQuery("#inesonic-quantity-row").hide();
        }
    } else {
        jQuery("#billing-button").hide();
        jQuery("#subscription-table").hide();
        jQuery("#subscription-table").width(0);
    }

    if (Object.keys(canAssignOthersTo).length > 0) {
        jQuery(".inesonic-group-account").show();

        if ("manager" in canAssignOthersTo || "manager_user" in canAssignOthersTo) {
            jQuery("#inesonic-text-members-prompt").hide();
            jQuery("#inesonic-text-members-and-managers-prompt").show();
        } else {
            jQuery("#inesonic-text-members-and-managers-prompt").hide();
            jQuery("#inesonic-text-members-prompt").show();
        }

        jQuery("#inesonic-group-account").show();
        jQuery("#inesonic-membership-table-area").show();
        jQuery("#inesonic-membership-table-area").jstree("refresh");
        jQuery("#inesonic-invitation-table-area").jstree("refresh");

        jQuery("#assign-seat-slider").prop("checked", canInstall);
    } else {
        jQuery(".inesonic-group-account").hide();
        jQuery("#inesonic-membership-table-area").hide();
    }
}

/**
 * Function that is triggered to update the user registered field.
 *
 * \param[in] userRegistered The Unix timestamp when the user first registered.
 */
function updateUserRegistered(userRegistered) {
    jQuery("#inesonic-user-registered").text(toDateTimeString(userRegistered));
}

/**
 * Function that is triggered to update the account subscription details.
 *
 * \param[in] subscription The subscription status information for the account.
 */
function updateSubscription(subscription) {
    if (subscription !== null) {
        let status = subscription.status;
        let paymentTerm = subscription.payment_term;
        let periodStart = subscription.period_start;
        let periodEnd = subscription.period_end;
        let quantity = subscription.quantity;
        let trialEnd = subscription.trial_end;
        let cancelPending = subscription.cancel_at_period_end;
        
        let statusString = status;
        if (cancelPending) {
            statusString += " (cancel pending)";
        }

        jQuery("#inesonic-status").text(statusString);
        jQuery("#inesonic-payment-term").text(paymentTerm);
        jQuery("#inesonic-period-start").text(toDateTimeString(periodStart));
        jQuery("#inesonic-period-end").text(toDateTimeString(periodEnd));
        jQuery("#inesonic-quantity").text(quantity);

        if (trialEnd === null) {
            jQuery("#inesonic-trial-end-row").hide();
        } else {
            jQuery("#inesonic-trial-end").text(toDateTimeString(trialEnd));
        }
    } else {
        jQuery("#inesonic-status").text("");
        jQuery("#inesonic-payment-term").text("");
        jQuery("#inesonic-period-start").text("");
        jQuery("#inesonic-period-end").text("");
        jQuery("#inesonic-trial-end").text("");
        jQuery("#inesonic-quantity").text("");
    }
}

/**
 * Function that handles a message dialog's "OK" button click event.
 */
function messageDialogOkButtonClicked() {
    jQuery("#message-dialog").dialog("close");
}

/**
 * Function that displays a message to the user.
 *
 * \param[in] message The message to be displayed.  Message should be in raw HTML.
 */
function displayMessage(message) {
    jQuery("#message-text").html(message);

    let windowWidth = window.innerWidth / 3;
    jQuery("#message-dialog").dialog({
        modal: true,
        width: windowWidth / 3,
        minWidth: windowWidth / 4,
        maxWidth: windowWidth / 2,
        position: {
            my: "center",
            at: "center",
            of: window
        }
    });
}

/**
 * Function that displays a yes-no dialog with message.
 *
 * \param[in] message The message to be displayed.
 *
 * \param[in] yesFunction The function to execute when "Yes" is clicked.  A value of null will cause the default
 *                        handler to be used, which closes the dialog.
 *
 * \param[in] noFunction  The function to execute when "No" is clicked.  A value of null will cause the default handler
 *                        to be used, which closes the dialog.
 *
 * \param[in] yesText     The text to display in the "Yes" button.  If null, "Yes" is displayed.
 *
 * \param[in] NoText      The text to display in the "No" button.  If null, "No" is displayed.
 */
function askYesNoQuestion(message, yesFunction, noFunction, yesText, noText) {
    jQuery("#yes-button").text(yesText === null ? "Yes" : yesText);
    jQuery("#no-button").text(noText === null ? "No" : noText);
    jQuery("#yes-no-question-text").text(message);

    jQuery("#yes-button").off("click");
    jQuery("#no-button").off("click");

    jQuery("#yes-button").on("click", function() {
        jQuery("#yes-no-dialog").dialog("close")

        if (yesFunction !==null) {
            yesFunction();
        }
    });

    jQuery("#no-button").on("click", function() {
        jQuery("#yes-no-dialog").dialog("close")

        if (noFunction !==null) {
            noFunction();
        }
    });

    let windowWidth = window.innerWidth / 3;
    jQuery("#yes-no-dialog").dialog({
        modal: true,
        position: {
            width: windowWidth / 3,
            minWidth: windowWidth / 4,
            maxWidth: windowWidth / 2,
            my: "center",
            at: "center",
            of: window
        }
    });
}

/**
 * Function that triggers a request for the installation key.
 */
function sendInstallKey() {
    jQuery.ajax(
        {
            type: "POST",
            url: INESONIC_AJAX_URL,
            timeout: AJAX_TIMEOUT,
            data: { "action" : "inesonic_send_install_key" },
            dataType: "json",
            success: function(response) {
                if (response !== null && response.status == "OK") {
                    displayMessage(INESONIC_MESSAGES['install-key-sent']);
                } else {
                    displayMessage(INESONIC_MESSAGES['failed-to-send-install-key']);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("Failed to send installation key: " + errorThrown);
            }
        }
    );
}

/**
 * Function that is triggered to build and display the invitation form.
 */
function inviteUserButtonClicked() {
    if (Object.keys(canAssignOthersTo).length > 1) {
        jQuery("#invite-member-dialog-multiple-account-types").show();
        jQuery("#invitation-user-type-selection").show();
        jQuery("#invite-as-user").prop("checked", true);
    } else {
        jQuery("#invite-member-dialog-multiple-account-types").hide();
        jQuery("#invitation-user-type-selection").hide();
    }

    jQuery("#invitation-email").val("");
    jQuery("#send-invitation").addClass("inesonic-disabled");

    let windowWidth = window.innerWidth;

    jQuery("#invite-member-dialog").dialog({
        modal: true,
        width: windowWidth / 2,
        minWidth: windowWidth / 3,
        maxWidth: windowWidth / 1.5,
        position: {
            my: "center",
            at: "center",
            of: window
        }
    });
}

/**
 * Function that is triggered to close the invitatin dialog.
 */
function cancelInvitationDialogButtonClicked() {
    jQuery("#invite-member-dialog").dialog("close");
}

/**
 * Function that is triggered to send an invitation to a new user.
 */
function sendInvitationButtonClicked() {
    let invitationEmail = jQuery("#invitation-email").val();
    if (invitationEmail.match(INESONIC_EMAIL_RE)) {
        let memberType = null;
        if (jQuery("#invite-as-user").prop("checked")) {
            memberType = "user";
        } else if (jQuery("#invite-as-manager").prop("checked")) {
            memberType = "manager";
        } else if (jQuery("#invite-as-manager-user").prop("checked")) {
            memberType = "manager_user";
        } else {
            memberType = "user";
        }

        jQuery.ajax(
            {
                type: "POST",
                url: INESONIC_AJAX_URL,
                timeout: AJAX_TIMEOUT,
                data: {
                    "action" : "inesonic_create_invitation",
                    "email" : invitationEmail,
                    "member_type" : memberType
                },
                dataType: "json",
                success: function(response) {
                    if (response !== null) {
                        if (response.status == 'OK') {
                            jQuery("#invite-member-dialog").dialog("close");
                            jQuery("#inesonic-invitation-table-area").jstree("refresh");
                        } else {
                            jQuery("#invite-member-dialog").dialog("close");
                            displayMessage(response.status);
                        }
                    } else {
                        displayMessage(INESONIC_MESSAGES["failed-to-send-invitation"]);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    jQuery("#invite-member-dialog").dialog("close");
                    alert("Failed to create invitation: " + errorThrown);
                }
            }
        );
    } else {
        jQuery("#send-invitation").addClass("inesonic-disabled");
    }
}

/**
 * Function that is triggered to cancel an invitation.
 *
 * \param[in] object The menu object that triggered this method.
 */
function cancelInvitation(object) {
    let treeArea = jQuery("#inesonic-invitation-table-area");
    let selectedItems = treeArea.jstree("get_selected", true);
    let emailAddress = selectedItems[0].text;

    jQuery.ajax(
        {
            type: "POST",
            url: INESONIC_AJAX_URL,
            timeout: AJAX_TIMEOUT,
            data: {
                "action" : "inesonic_cancel_invitation",
                "email" : emailAddress
            },
            dataType: "json",
            success: function(response) {
                if (response !== null) {
                    if (response.status == "OK") {
                        treeArea.jstree("refresh");
                    } else {
                        displayMessage(response.status);
                    }
                } else {
                    displayMessage(INESONIC_MESSAGES["failed-to-cancel-invitation"]);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("Failed to cancel invitation: " + errorThrown);
            }
        }
    );
}

/**
 * Function that is triggered when an invitation type is to be changed.
 *
 * \param[in] object The object that triggered this request.
 */
function changeInvitationType(object) {
    let treeArea = jQuery("#inesonic-invitation-table-area");
    let selectedItems = treeArea.jstree("get_selected", true);
    let emailAddress = selectedItems[0].text;

    let memberType = object.item.member_type;

    jQuery.ajax(
        {
            type: "POST",
            url: INESONIC_AJAX_URL,
            timeout: AJAX_TIMEOUT,
            data: {
                    "action" : "inesonic_create_invitation",
                    "email" : emailAddress,
                    "member_type" : memberType
            },
            dataType: "json",
            success: function(response) {
                if (response !== null) {
                    if (response.status == 'OK') {
                        treeArea.jstree("refresh");
                    } else {
                        displayMessage(response.status);
                    }
                } else {
                    displayMessage(INESONIC_MESSAGES["failed-to-send-invitation"]);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                jQuery("#invite-member-dialog").dialog("close");
                alert("Failed to create invitation: " + errorThrown);
            }
        }
    );
}

/**
 * Function that is triggered to resend an existing invitation.
 *
 * \param[in] object The object that triggered this request.
 */
function resendInvitation(object) {
    let treeArea = jQuery("#inesonic-invitation-table-area");
    let selectedItems = treeArea.jstree("get_selected", true);
    let emailAddress = selectedItems[0].text;
    let roleName = selectedItems[0].type;
    let memberType = memberTypesByRole[roleName];

    jQuery.ajax(
        {
            type: "POST",
            url: INESONIC_AJAX_URL,
            timeout: AJAX_TIMEOUT,
            data: {
                    "action" : "inesonic_create_invitation",
                    "email" : emailAddress,
                    "member_type" : memberType
            },
            dataType: "json",
            success: function(response) {
                if (response !== null) {
                    if (response.status == 'OK') {
                        displayMessage(INESONIC_MESSAGES["invitation-resent"]);
                    } else {
                        displayMessage(response.status);
                    }
                } else {
                    displayMessage(INESONIC_MESSAGES["failed-to-send-invitation"]);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                jQuery("#invite-member-dialog").dialog("close");
                alert("Failed to create invitation: " + errorThrown);
            }
        }
    );
}

/**
 * Function that is triggered to validate the invitation field.
 */
function validateInvitationField() {
    let currentEntry = jQuery("#invitation-email").val();
    if (currentEntry.match(INESONIC_EMAIL_RE)) {
        jQuery("#send-invitation").removeClass("inesonic-disabled");
    } else {
        jQuery("#send-invitation").addClass("inesonic-disabled");
    }
}

/**
 * Function that obtains the current account status information.
 */
function getAccountStatus() {
    jQuery.ajax(
        {
            type: "POST",
            url: INESONIC_AJAX_URL,
            timeout: AJAX_TIMEOUT,
            data: { "action" : "inesonic_get_account_status" },
            dataType: "json",
            success: function(response) {
                if (response !== null && response.status == "OK") {
                    let userType = response.user_type;
                    let userSettings = response.settings;
                    let subscription = response.subscription;
                    let userRegistered = response.user_registered;

                    updateAccountStatus(userType, userSettings);
                    updateUserRegistered(userRegistered);
                    updateSubscription(subscription);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Failed to obtain account status: " + errorThrown);
            }
        }
    );
}

/**
 * Function that is triggered to validate that an operation is allowed for a member.
 *
 * \param[in] operation     A string indicating the operation to be performed.
 *
 * \param[in] node          The node being operated on.
 *
 * \param[in] node_parent   The parent node.
 *
 * \param[in] node_position The position of the node.
 *
 * \param[in] more          Additional information tied to the operation.
 *
 * \return Returns true if the operation is allowed.  Returns false if the operation is not allowed.
 */
function validateMembershipOperation(operation, node, node_parent, node_position, more) {
    let isAllowed = false;
    if (operation == "move_node") {
        if (more.dnd && more.ref) {
            let movingNodeCid = node.id;
            let movingNodeType = node.type;
            let destinationNode = more.ref;

            let proposedDestinationNodeCid = destinationNode.id;
            let proposedDestinationNodeType = destinationNode.type;

            if (proposedDestinationNodeType in INESONIC_ROLES) {
                let destinationRoles = INESONIC_ROLES[proposedDestinationNodeType];
                let destinationCanAccept = Object.values(destinationRoles.can_assign_others_to);

                if (destinationCanAccept.includes(movingNodeType)) {
                    destinationNodeCid = proposedDestinationNodeCid;
                    destinationNodeType = proposedDestinationNodeType;

                    isAllowed = true;
                } else {
                    destinationNodeCid = null;
                    destinationNodeType = null;
                }
            }
        } else {
            // We come through here when a node is finally dropped.  There's insufficient information to identify the
            // details but we should have gone through the other path.  In this case we assume the destination CID will
            // give us the information we need.

            isAllowed = (destinationNodeCid !== null);
        }
    } else {
        console.log(operation);
    }

    return isAllowed;
}

/**
 * Function that is triggered to validate that an operation is allowed for an invitee.
 *
 * \param[in] operation     A string indicating the operation to be performed.
 *
 * \param[in] node          The node being operated on.
 *
 * \param[in] node_parent   The parent node.
 *
 * \param[in] node_position The position of the node.
 *
 * \param[in] more          Additional information tied to the operation.
 *
 * \return Returns true if the operation is allowed.  Returns false if the operation is not allowed.
 */
function validateInvitationOperation(operation, node, node_parent, node_position, more) {
    return false;
}

/**
 * Function that is triggered when a member's position is being changed by the user.
 *
 * \param[in] event The event that triggered this call.
 *
 * \param[in] data  Data tied to the event.
 */
function memberPositionChanged(event, data) {
    if (data && data.node && destinationNodeCid && destinationNodeType) {
        let nodeToMove = data.node.id;

        jQuery.ajax(
            {
                type: "POST",
                url: INESONIC_AJAX_URL,
                timeout: AJAX_TIMEOUT,
                data: {
                    "action" : "inesonic_reassign_member",
                    "member_cid" : Number(nodeToMove),
                    "new_manager_cid" : Number(destinationNodeCid)
                },
                dataType: "json",
                success: function(response) {
                    jQuery("#inesonic-membership-table-area").jstree("refresh");

                    if (response !== null) {
                        if (response.status == "OK") {
                            autoOpenNodeCid = destinationNodeCid;
                        } else {
                            displayMessage(response.status);
                        }
                    } else {
                        displayMessage("Invalid response from server.");
                    }

                    destinationNodeCid = null;
                    destinationNodeType = null;
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Failed to reassign member: " + errorThrown);
                }
            }
        );
    }
}

/**
 * Function that is triggered to remove a member from a team.
 *
 * \param[in] memberId The ID of the member to be removed.
 */
function removeMember(memberId) {
    let membershipTableArea = jQuery("#inesonic-membership-table-area");
    let nodeToRemove = membershipTableArea.jstree("get_node", memberId);
    let displayName = nodeToRemove.text.substr(0, nodeToRemove.text.lastIndexOf("(")).trim();

    askYesNoQuestion(
        "Are you sure you wish to remove member " + displayName + "?",
        function() {
            jQuery.ajax(
                {
                    type: "POST",
                    url: INESONIC_AJAX_URL,
                    timeout: AJAX_TIMEOUT,
                    data: {
                        "action" : "inesonic_remove_member",
                        "cid" : Number(memberId),
                    },
                    dataType: "json",
                    success: function(response) {
                        if (response !== null) {
                            if (response.status == 'OK') {
                                membershipTableArea.jstree("refresh");
                                if (response.updated_account_settings) {
                                    getAccountStatus();
                                }
                            } else {
                                displayMessage(response.status);
                            }
                        } else {
                            displayMessage("Invalid response from server");
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        alert("Failed: " + errorThrown);
                    }
                }
            );
        },
        null,
        null,
        null
    );
}

/**
 * Function that is triggered to change a user's role.
 *
 * \param[in] memberId The ID of the member.
 *
 * \param[in] newRole  The new role for the user.
 */
function changeUserRoleTo(memberId, assignableRole) {
    jQuery.ajax(
        {
            type: "POST",
            url: INESONIC_AJAX_URL,
            timeout: AJAX_TIMEOUT,
            data: {
                "action" : "inesonic_change_member_role",
                "cid" : Number(memberId),
                "new_role" : assignableRole
            },
            dataType: "json",
            success: function(response) {
                if (response && response.status) {
                    if (response.status != 'OK') {
                        displayMessage(response.status);
                    } else {
                        jQuery("#inesonic-membership-table-area").jstree("refresh");
                        if (response.updated_account_settings) {
                            getAccountStatus();
                        }
                    }
                } else {
                    displayMessage("Invalid response from server");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("Failed: " + errorThrown);
            }
        }
    );
}

/**
 * Function that is triggered to build the membership node's context menu.
 *
 * \param[in] node The node to build the context menu for.
 */
function buildMembershipContextMenu(node) {
    let parentRoleData = {};

    let membershipTableArea = jQuery("#inesonic-membership-table-area");
    let parentId = node.parent;
    if (parentId != "#") {
        let parentNode = membershipTableArea.jstree("get_node", parentId);
        let parentNodeType = membershipTableArea.jstree("get_type", parentNode);

        parentRoleData = INESONIC_ROLES[parentNodeType];
    }

    let nodeType = membershipTableArea.jstree("get_type", node.id);
    let nodeRoleData = INESONIC_ROLES[nodeType];

    if (nodeRoleData.maximum_members != 0) {
        if (node.state.opened) {
            result = {
                "collapse" : {
                    "separator_before" : false,
                    "separator_after" : false,
                    "label" : "Collapse",
                    "action" : function() {
                        membershipTableArea.jstree("toggle_node", node);
                    }
                }
            };
        } else {
            result = {
                "expand" : {
                    "separator_before" : false,
                    "separator_after" : false,
                    "label" : "Expand",
                    "action" : function() {
                        membershipTableArea.jstree("toggle_node", node);
                    }
                }
            };
        }
    } else {
        result = {};
    }

    if (parentId != "#") {
        result["remove"] = {
            "separator_before" : false,
            "separator_after" : false,
            "label" : "Remove",
            "action" : function() {
                removeMember(node.id);
            }
        };
    }

    let firstEntry = true;
    if (parentRoleData.can_assign_others_to) {
        let parentCanAssignOthersTo = parentRoleData.can_assign_others_to;
        jQuery.each(parentCanAssignOthersTo, function(roleName, assignableRole) {
            if (assignableRole != nodeType) {
                let assignableRoleData = INESONIC_ROLES[assignableRole];
                let assignableRoleDescription = assignableRoleData.description;
                let assignableRoleIcon = assignableRoleData.role_icon;

                let contextMenuEntry = {
                    "member_type" : roleName,
                    "separator_before" : firstEntry,
                    "separator_after" : false,
                    "label" : "Change to " + assignableRoleDescription,
                    "action" : function() {
                        changeUserRoleTo(node.id, assignableRole);
                    }
                };

                if (assignableRoleIcon !== null) {
                    contextMenuEntry["icon"] = INESONIC_IMAGE_URLS[assignableRoleIcon];
                }

                result[assignableRole] = contextMenuEntry;

                firstEntry = false;
            }
        });
    }

    return result;
}

/**
 * Function that is triggered to build the invitation node's context menu.
 *
 * \param[in] node The node to build the context menu for.
 */
function buildInvitationContextMenu(node) {
    let nodeType = jQuery("#inesonic-invitation-table-area").jstree("get_type", node);
    let roleData = INESONIC_ROLES[nodeType];

    result = {
        "resend" : {
            "separator_before" : false,
            "separator_after" : false,
            "label" : "Resend Invitation",
            "action" : resendInvitation
        },
        "remove" : {
            "separator_before" : false,
            "separator_after" : false,
            "label" : "Cancel Invitation",
            "action" : cancelInvitation
        }
    };

    let firstEntry = true;
    jQuery.each(canAssignOthersTo, function(roleName, assignableRole) {
        if (assignableRole != nodeType) {
            let assignableRoleData = INESONIC_ROLES[assignableRole];
            let assignableRoleDescription = assignableRoleData.description;
            let assignableRoleIcon = assignableRoleData.role_icon;

            let contextMenuEntry = {
                "member_type" : roleName,
                "separator_before" : firstEntry,
                "separator_after" : false,
                "label" : "Change to " + assignableRoleDescription,
                "action" : changeInvitationType
            };

            if (assignableRoleIcon !== null) {
                contextMenuEntry["icon"] = INESONIC_IMAGE_URLS[assignableRoleIcon];
            }

            result[assignableRole] = contextMenuEntry;

            firstEntry = false;
        }
    });

    return result;
}

/**
 * Function that builds the membership jsTree type data.
 */
function buildMembershipJsTreeTypeData() {
    let result = {};

    for (const roleId in INESONIC_ROLES) {
        const roleData = INESONIC_ROLES[roleId];
        let maximumMembers = roleData.maximum_members;

        let canAssignOthersTo = roleData.can_assign_others_to;

        let iconName = null;
        if (maximumMembers < 0 || maximumMembers > 1) {
            if (roleData.can_install) {
                iconName = "manager_member";
            } else {
                iconName = "manager";
            }
        } else {
            iconName = "member";
        }

        let iconUrl = INESONIC_IMAGE_URLS[iconName];
        result[roleId] = {
            "valid_children" : canAssignOthersTo.length == 0 ? "none" : canAssignOthersTo,
            "icon" : iconUrl
        }
    }

    return result;
}

/**
 * Function that builds the invitation jsTree type data.
 */
function buildInvitationJsTreeTypeData() {
    let result = {};

    for (const roleId in INESONIC_ROLES) {
        const roleData = INESONIC_ROLES[roleId];
        let maximumMembers = roleData.maximum_members;

        let iconName = null;
        if (maximumMembers < 0 || maximumMembers > 1) {
            if (roleData.can_install) {
                iconName = "manager_member";
            } else {
                iconName = "manager";
            }
        } else {
            iconName = "member";
        }

        let iconUrl = INESONIC_IMAGE_URLS[iconName];
        result[roleId] = {
            "max_children" : 0,
            "valid_children" : "none",
            "icon" : iconUrl
        }
    }

    return result;
}

/**
 * Function that returns the membership AJAX request data.
 *
 * \param[in] node The node we're querying results for.
 *
 * \return Returns a dictionary holding the request data.
 */
function getMembershipData(node) {
    let nodeId = node.id;
    let result = { "action" : "inesonic_get_membership_data" };

    if (nodeId != '#') {
        result["cid"] = Number(nodeId);
    }

    return result;
}

/**
 * Function that returns the invitation AJAX request data.
 *
 * \param[in] node The node we're querying results for.
 *
 * \return Returns a dictionary holding the request data.
 */
function getInvitationData(node) {
    return { "action" : "inesonic_get_invitation_data" };
}

/**
 * Function that is called after the membership data is loaded to perform post processing on the form.
 *
 * \param[in] data The received data.
 */
function postProcessMembershipData(data) {
    if (data.length == 1 && 'state' in data[0]) {
        let children = data[0].children;
        if (children.length > 0) {
            jQuery("#membership-list-area").show();

            if (autoOpenNodeCid !== null) {
                setTimeout(
                    function() {
                        jQuery("#inesonic-membership-table-area").jstree("toggle_node", autoOpenNodeCid);
                        autoOpenNodeCid = null;
                    },
                    100
                );
            }
        } else {
            jQuery("#membership-list-area").hide();
        }
    }
}

/**
 * Function that is called after the invitation data is loaded to perform post processing on the form.
 *
 * \param[in] data The received data.
 */
function postProcessInvitationData(data) {
    if (data.length == 0) {
        jQuery("#invitation-list-area").hide();
    } else {
        jQuery("#invitation-list-area").show();
    }
}

/**
 * Function that is triggered when the "Assign Seat To Me" slider is clicked.
 */
function assignSeatToMeSliderChanged() {
    let nowChecked = jQuery("#assign-seat-slider").prop("checked");
    if ((canInstall && !nowChecked) || (!canInstall && nowChecked)) {
        jQuery.ajax(
            {
                type: "POST",
                url: INESONIC_AJAX_URL,
                timeout: AJAX_TIMEOUT,
                data: {
                    "action" : "inesonic_change_user_role",
                    "can_install" : nowChecked
                },
                dataType: "json",
                success: function(response) {
                    if (response && response.status) {
                        if (response.status != 'OK') {
                            displayMessage(response.status);
                        }
                    } else {
                        displayMessage("Invalid response form server.");
                    }

                    getAccountStatus();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert("Failed to change seat assignments: " + errorThrown);
                }
            }
        );
    }
}

/**
 * Function that identifies the host system (the fact that JavaScript doesn't have a clean way of doing this is
 * shocking, but here we are).
 *
 * \return Returns a string indicating the host system.
 */
function inesonicDetectOs() {
	let os = null;
	let appVersion = navigator.appVersion;
	if (appVersion.indexOf("Win") >= 0) {
		os = "windows";
	} else if (appVersion.indexOf("Mac") >= 0) {
		os = "macos";
	} else if (appVersion.indexOf("Linux") >= 0) {
		let userAgent = navigator.userAgent;
		os = "linux";
	} else if (appVersion.indexOf("X11") >= 0) {
		os = "unix";
	}

	return os;
}

/**
 * Function that sets the current operating system for downloads programmatically.
 *
 * \param[in] operatingSystem The new operating system.
 */
function inesonicSetOs(operatingSystem) {
	let selections = jQuery("#inesonic-download-button-platform-select option");
	let numberSelections = selections.length;
	let i = 0;
	while (i < numberSelections                                                                     &&
		   selections[i].text.toLowerCase().replace(/[^a-z0-9]/g, "_").indexOf(operatingSystem) < 0    ) {
		selections[i].selected = false;
		++i;
	}

	if (i >= numberSelections) {
		i = 0;
	}

	selections[i].selected = true;
	++i;
	
	while (i < numberSelections) {
		selections[i].selected = false;
		++i;
	}

	inesonicPlatformChanged();
}

/**
 * Function that is triggered when the currently selected platform is changed.
 */
function inesonicPlatformChanged() {
	let platform = jQuery("#inesonic-download-button-platform-select").val();
	let downloadButton = jQuery("#inesonic-download-button");
	let shasumArea = jQuery("#inesonic-download-button-shasum-area");
	
	if (platform == "-") {
		downloadButton.addClass("inesonic-disable-anchor");
		shasumArea.hide();
	} else {
		downloadButton.removeClass("inesonic-disable-anchor");
		shasumArea.show();

		let shasum = PLATFORM_DATA[platform].shasum;
		jQuery("#inesonic-download-button-shasum").text(shasum);
	}
}

/**
 * Function that is triggered when the user requests a download.
 *
 * \param[in] event The event that triggered this action.
 */
function inesonicDownload(event) {
	let platform = jQuery("#inesonic-download-button-platform-select").val();
	if (platform in PLATFORM_DATA) {
		let downloadUrl = PLATFORM_DATA[platform].download_url;
		window.open(downloadUrl, "_self");
	}
}

/***********************************************************************************************************************
 * Main:
 */

let anchorDisableCss = ".inesonic-disable-anchor { pointer_events: none; color: #C0C0C0; }";
jQuery("head").append(
    "<style type=\"text/css\">" + anchorDisableCss + "</style>"
);

jQuery(document).ready(function() {
	let operatingSystem = inesonicDetectOs();

	inesonicSetOs(operatingSystem);
	
	jQuery("#inesonic-download-button-platform-select").change(inesonicPlatformChanged);
	jQuery("#inesonic-download-button").click(inesonicDownload);
});
