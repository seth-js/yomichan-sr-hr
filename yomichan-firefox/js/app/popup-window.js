/*
 * Copyright (C) 2020-2022  Yomichan Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * This class represents a popup that is hosted in a new native window.
 */
class PopupWindow extends EventDispatcher {
    /**
     * Creates a new instance.
     * @param {object} details Details about how to set up the instance.
     * @param {string} details.id The ID of the popup.
     * @param {number} details.depth The depth of the popup.
     * @param {number} details.frameId The ID of the host frame.
     */
    constructor({
        id,
        depth,
        frameId
    }) {
        super();
        this._id = id;
        this._depth = depth;
        this._frameId = frameId;
        this._popupTabId = null;
    }

    /**
     * The ID of the popup.
     * @type {string}
     */
    get id() {
        return this._id;
    }

    get parent() {
        return null;
    }

    /**
     * The parent of the popup, which is always `null` for `PopupWindow` instances,
     * since any potential parent popups are in a different frame.
     * @param {Popup} _value The parent to assign.
     * @throws {Error} Throws an error, since this class doesn't support children.
     */
    set parent(_value) {
        throw new Error('Not supported on PopupWindow');
    }

    /**
     * The popup child popup, which is always null for `PopupWindow` instances,
     * since any potential child popups are in a different frame.
     * @type {Popup}
     */
    get child() {
        return null;
    }

    /**
     * Attempts to set the child popup.
     * @param {Popup} _value The child to assign.
     * @throws Throws an error, since this class doesn't support children.
     */
    set child(_value) {
        throw new Error('Not supported on PopupWindow');
    }

    /**
     * The depth of the popup.
     * @type {numer}
     */
    get depth() {
        return this._depth;
    }

    /**
     * Gets the content window of the frame. This value is null,
     * since the window is hosted in a different frame.
     * @type {Window}
     */
    get frameContentWindow() {
        return null;
    }

    /**
     * Gets the DOM node that contains the frame.
     * @type {Element}
     */
    get container() {
        return null;
    }

    /**
     * Gets the ID of the frame.
     * @type {number}
     */
    get frameId() {
        return this._frameId;
    }

    /**
     * Sets the options context for the popup.
     * @param {object} optionsContext The options context object.
     * @returns {Promise<void>}
     */
    setOptionsContext(optionsContext) {
        return this._invoke(false, 'Display.setOptionsContext', {id: this._id, optionsContext});
    }

    /**
     * Hides the popup. This does nothing for `PopupWindow`.
     * @param {boolean} _changeFocus Whether or not the parent popup or host frame should be focused.
     */
    hide(_changeFocus) {
        // NOP
    }

    /**
     * Returns whether or not the popup is currently visible.
     * @returns {Promise<boolean>} `true` if the popup is visible, `false` otherwise.
     */
    async isVisible() {
        return (this._popupTabId !== null && await yomichan.api.isTabSearchPopup(this._popupTabId));
    }

    /**
     * Force assigns the visibility of the popup.
     * @param {boolean} _value Whether or not the popup should be visible.
     * @param {number} _priority The priority of the override.
     * @returns {Promise<string?>} A token used which can be passed to `clearVisibleOverride`,
     *   or null if the override wasn't assigned.
     */
    async setVisibleOverride(_value, _priority) {
        return null;
    }

    /**
     * Clears a visibility override that was generated by `setVisibleOverride`.
     * @param {string} _token The token returned from `setVisibleOverride`.
     * @returns {boolean} `true` if the override existed and was removed, `false` otherwise.
     */
    clearVisibleOverride(_token) {
        return false;
    }

    /**
     * Checks whether a point is contained within the popup's rect.
     * @param {number} _x The x coordinate.
     * @param {number} _y The y coordinate.
     * @returns {Promise<boolean>} `true` if the point is contained within the popup's rect, `false` otherwise.
     */
    async containsPoint(_x, _y) {
        return false;
    }

    /**
     * Shows and updates the positioning and content of the popup.
     * @param {Popup.ContentDetails} _details Settings for the outer popup.
     * @param {Display.ContentDetails} displayDetails The details parameter passed to `Display.setContent`.
     * @returns {Promise<void>}
     */
    async showContent(_details, displayDetails) {
        if (displayDetails === null) { return; }
        await this._invoke(true, 'Display.setContent', {id: this._id, details: displayDetails});
    }

    /**
     * Sets the custom styles for the popup content.
     * @param {string} css The CSS rules.
     * @returns {Promise<void>}
     */
    setCustomCss(css) {
        return this._invoke(false, 'Display.setCustomCss', {id: this._id, css});
    }

    /**
     * Stops the audio auto-play timer, if one has started.
     * @returns {Promise<void>}
     */
    clearAutoPlayTimer() {
        return this._invoke(false, 'Display.clearAutoPlayTimer', {id: this._id});
    }

    /**
     * Sets the scaling factor of the popup content.
     * @param {number} _scale The scaling factor.
     */
    setContentScale(_scale) {
        // NOP
    }

    /**
     * Returns whether or not the popup is currently visible, synchronously.
     * @throws An exception is thrown for `PopupWindow` since it cannot synchronously detect visibility.
     */
    isVisibleSync() {
        throw new Error('Not supported on PopupWindow');
    }

    /**
     * Updates the outer theme of the popup.
     */
    async updateTheme() {
        // NOP
    }

    /**
     * Sets the custom styles for the outer popup container.
     * This does nothing for `PopupWindow`.
     * @param {string} _css The CSS rules.
     * @param {boolean} _useWebExtensionApi Whether or not web extension APIs should be used to inject the rules.
     *   When web extension APIs are used, a DOM node is not generated, making it harder to detect the changes.
     */
    async setCustomOuterCss(_css, _useWebExtensionApi) {
        // NOP
    }

    /**
     * Gets the rectangle of the DOM frame, synchronously.
     * @returns {Popup.ValidRect} The rect.
     *   `valid` is `false` for `PopupProxy`, since the DOM node is hosted in a different frame.
     */
    getFrameRect() {
        return {left: 0, top: 0, right: 0, bottom: 0, valid: false};
    }

    /**
     * Gets the size of the DOM frame.
     * @returns {Promise<{width: number, height: number, valid: boolean}>} The size and whether or not it is valid.
     */
    async getFrameSize() {
        return {width: 0, height: 0, valid: false};
    }

    /**
     * Sets the size of the DOM frame.
     * @param {number} _width The desired width of the popup.
     * @param {number} _height The desired height of the popup.
     * @returns {Promise<boolean>} `true` if the size assignment was successful, `false` otherwise.
     */
    async setFrameSize(_width, _height) {
        return false;
    }

    // Private

    async _invoke(open, action, params={}, defaultReturnValue) {
        if (yomichan.isExtensionUnloaded) {
            return defaultReturnValue;
        }

        const frameId = 0;
        if (this._popupTabId !== null) {
            try {
                return await yomichan.crossFrame.invokeTab(this._popupTabId, frameId, 'popupMessage', {action, params});
            } catch (e) {
                if (yomichan.isExtensionUnloaded) {
                    open = false;
                }
            }
            this._popupTabId = null;
        }

        if (!open) {
            return defaultReturnValue;
        }

        const {tabId} = await yomichan.api.getOrCreateSearchPopup({focus: 'ifCreated'});
        this._popupTabId = tabId;

        return await yomichan.crossFrame.invokeTab(this._popupTabId, frameId, 'popupMessage', {action, params});
    }
}