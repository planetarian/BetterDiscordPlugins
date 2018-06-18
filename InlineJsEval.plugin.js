//META{"name":"InlineJsEval","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://github.com/planetarian/BetterDiscordPlugins/blob/master/InlineJsEval.plugin.js"}*//

class InlineJsEval {
    getName() { return "InlineJsEval"; }
    getDescription() {
        return "JavaScript eval() plugin -- type e.g. eval(1 + 1) and press tab to execute the eval. Basically an inline JS console, more or less. Drive responsibly.";
    }
    getVersion() { return "0.0.4"; }
    getAuthor() { return "Chami"; }
    getSettingsPanel() { return "<h3>" + this.getName() + " Settings</h3>"; }

    constructor() { }

    // Called when the plugin is loaded in to memory
    load() { this.log('Loaded'); }

    // Called when the plugin is activated (including after reloads)
    start() {
        let libraryScript = document.getElementById('zeresLibraryScript');
        if (!libraryScript || (window.ZeresLibrary && window.ZeresLibrary.isOutdated)) {
            if (libraryScript) libraryScript.parentElement.removeChild(libraryScript);
            libraryScript = document.createElement("script");
            libraryScript.setAttribute("type", "text/javascript");
            libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
            libraryScript.setAttribute("id", "zeresLibraryScript");
            document.head.appendChild(libraryScript);
        }

        if (window.ZeresLibrary) this.initialize();
        else libraryScript.addEventListener("load", () => { this.initialize(); });
        
        this.log('Started');
    }

    // Called when the plugin is deactivated
    stop() {
        $('.chat textarea').off('keydown.js_eval');
        this.log('Stopped');
    }

    unload() { this.log('Unloaded'); }

    log(text) {
        return console.log(`[%c${this.getName()}%c] ${text}`,
            'color: #F7D; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    observer({ addedNodes, removedNodes }) {
        if(addedNodes && addedNodes[0] && addedNodes[0].classList
            && addedNodes[0].classList.contains('messages-wrapper')) {
            this.update();
        }
    }

    // Called when a message is received
    onMessage() {}

    // Called when a server or channel is switched
    onSwitch() {}
    
    initialize(){
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(),
            "https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/InlineJsEval.plugin.js");
        this.update();
    }

    update() {
        let textArea = $('.chat textarea');
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
