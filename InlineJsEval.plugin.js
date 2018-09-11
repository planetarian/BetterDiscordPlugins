//META{"name":"InlineJsEval","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://github.com/planetarian/BetterDiscordPlugins/blob/master/InlineJsEval.plugin.js"}*//

/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you tried to run me directly. This is not desired behavior! It will work now, but likely will not work with other plugins. Even worse, with other untrusted plugins it may lead computer virus infection!", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.\nJust reload Discord with Ctrl+R.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!\nJust reload Discord with Ctrl+R.", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else @*/

class InlineJsEval {
    getName() { return "InlineJsEval"; }
    getDescription() {
        return "JavaScript eval() plugin -- type e.g. eval(1 + 1) and press tab to execute the eval. Basically an inline JS console, more or less. Drive responsibly.\r\n"
        + "<h3>Note: 'Normalize Classes' option must be enabled for this plugin to function.</h3>";
    }
    getVersion() { return "0.0.6"; }
    getAuthor() { return "Chami"; }
    getSettingsPanel() { return "<h3>" + this.getName() + " Settings</h3>"; }

    constructor() { }

    // Called when the plugin is loaded in to memory
    load() { this.log('Loaded'); }

    // Called when the plugin is activated (including after reloads)
    start() {
        this.log('Starting');
        let libraryScript = document.getElementById('zeresLibraryScript');
        if (!libraryScript || (window.ZeresLibrary && window.ZeresLibrary.isOutdated)) {
            if (libraryScript) libraryScript.parentElement.removeChild(libraryScript);
            libraryScript = document.createElement("script");
            libraryScript.setAttribute("type", "text/javascript");
            libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
            libraryScript.setAttribute("id", "zeresLibraryScript");
            document.head.appendChild(libraryScript);
        }

        this.initialized = false;
        if (window.ZeresLibrary) this.initialize();
        else libraryScript.addEventListener("load", () => { this.initialize(); });
        // Fallback in case load fails to fire (https://github.com/planetarian/BetterDiscordPlugins/issues/2)
        setTimeout(this.initialize.bind(this), 5000);
    }

    // Called when the plugin is deactivated
    stop() {
        $('.da-chat textarea').off('keydown.js_eval');
        this.log('Stopped');
    }

    unload() { this.log('Unloaded'); }

    log(text) {
        return console.log(`[%c${this.getName()}%c] ${text}`,
            'color: #F7D; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    error(text) {
        try {
            PluginUtilities.showToast(`[${this.getName()}] Error: ${text}`, {type:'error'});
        }
        catch (err) {}
        return console.error(`[%c${this.getName()}%c] ${text}`,
            'color: #F7D; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    observer({ addedNodes, removedNodes }) {
        if(addedNodes && addedNodes[0] && addedNodes[0].classList
            && addedNodes[0].classList.contains('da-messagesWrapper')) {
            this.update();
        }
    }

    // Called when a message is received
    onMessage() {}

    // Called when a server or channel is switched
    onSwitch() {}
    
    initialize(){
        if (this.initialized) return;
        this.initialized = true;

        this.update();
        try {
            PluginUtilities.checkForUpdate(this.getName(), this.getVersion(),
                "https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/InlineJsEval.plugin.js");
        }
        catch (err) {
            this.error(err);
        }
        this.log("Initialized");
    }

    update() {
        let textArea = $('.da-chat textarea');
        if (!textArea.length) return;

        let inputBox = textArea[0];
        textArea.off('keydown.js_eval').on('keydown.js_eval', (e) => {
            if (e.which == 9 && inputBox.value) {
                let cursorPos = inputBox.selectionEnd;
                let value = inputBox.value.substring(0, cursorPos);
                let tail = inputBox.value.substring(cursorPos);

                let regex = /eval\((.*)\)$/g;
                if (regex.test(value)) {
                    try {
                        value = value.replace(regex, this.doEval.bind(this)) + tail;
                    }
                    catch (ex) {
                        PluginUtilities.showToast(ex, {type: 'error'});
                        return;
                    }
                    finally {
                        inputBox.focus();
                        inputBox.select();
                        document.execCommand("insertText", false, value);
                        // Set the cursor position to the end of the eval'd expression result
                        let newCursorPos = value.length - tail.length;
                        inputBox.setSelectionRange(newCursorPos, newCursorPos);
                    }
                }
            }
        });
        this.initialized = true;
    }

    doEval(match, str, offset, string) {
        this.log('eval: ' + str);
        let result = eval(str);
        return result;
    }
}
