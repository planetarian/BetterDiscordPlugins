//META{"name":"Texty","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://github.com/planetarian/BetterDiscordPlugins/blob/master/Texty.plugin.js"}*//

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

class Texty {
    getName() { return "Texty"; }
    getDescription() { return "An obnoxious plugin that translates e[text] into emoji form."; }
    getVersion() { return "0.0.2"; }
    getAuthor() { return "Chami"; }
    getSettingsPanel() { return "<h3>Texty Settings</h3>"; }

    constructor() {
        this.matches = {
            'ab': { index: 0, emoji: ['ab']},
            '10': { index: 0, emoji: ['keycap_ten']},
            '!!': { index: 0, emoji: ['bangbang']},
            '!?': { index: 0, emoji: ['interrobang']},
            'ng': { index: 0, emoji: ['ng']},
            'id': { index: 0, emoji: ['id']},
            'ok': { index: 0, emoji: ['ok']},
            'vs': { index: 0, emoji: ['vs']},
            'a': { index: 0, emoji: ['regional_indicator_a','a','arrow_up_small']},
            'b': { index: 0, emoji: ['regional_indicator_b','b']},
            'c': { index: 0, emoji: ['regional_indicator_c','arrow_right_hook','compression']},
            'd': { index: 0, emoji: ['regional_indicator_d']},
            'e': { index: 0, emoji: ['regional_indicator_e']},
            'f': { index: 0, emoji: ['regional_indicator_f']},
            'g': { index: 0, emoji: ['regional_indicator_g']},
            'h': { index: 0, emoji: ['regional_indicator_h','pisces']},
            'i': { index: 0, emoji: ['regional_indicator_i','information_source']},
            'j': { index: 0, emoji: ['regional_indicator_j','arrow_heading_up']},
            'k': { index: 0, emoji: ['regional_indicator_k']},
            'l': { index: 0, emoji: ['regional_indicator_l']},
            'm': { index: 0, emoji: ['regional_indicator_m','m']},
            'n': { index: 0, emoji: ['regional_indicator_n']},
            'o': { index: 0, emoji: ['regional_indicator_o','o2','o','arrows_counterclockwise']},
            'p': { index: 0, emoji: ['regional_indicator_p','parking']},
            'q': { index: 0, emoji: ['regional_indicator_q']},
            'r': { index: 0, emoji: ['regional_indicator_r']},
            's': { index: 0, emoji: ['regional_indicator_s']},
            't': { index: 0, emoji: ['regional_indicator_t','cross']},
            'u': { index: 0, emoji: ['regional_indicator_u']},
            'v': { index: 0, emoji: ['regional_indicator_v']},
            'w': { index: 0, emoji: ['regional_indicator_w']},
            'x': { index: 0, emoji: ['regional_indicator_x','negative_squared_cross_mark','x']},
            'y': { index: 0, emoji: ['regional_indicator_y']},
            'z': { index: 0, emoji: ['regional_indicator_z']},
            '0': { index: 0, emoji: ['zero']},
            '1': { index: 0, emoji: ['one']},
            '2': { index: 0, emoji: ['two']},
            '3': { index: 0, emoji: ['three']},
            '4': { index: 0, emoji: ['four']},
            '5': { index: 0, emoji: ['five']},
            '6': { index: 0, emoji: ['six']},
            '7': { index: 0, emoji: ['seven']},
            '8': { index: 0, emoji: ['eight']},
            '9': { index: 0, emoji: ['nine']},
            '!': { index: 0, emoji: ['grey_exclamation','exclamation','warning','heart_exclamation']},
            '.': { index: 0, emoji: ['diamond_shape_with_a_dot_inside']},
            '?': { index: 0, emoji: ['grey_question','question']},
            '#': { index: 0, emoji: ['hash']},
            '-': { index: 0, emoji: ['no_entry']},
            '*': { index: 0, emoji: ['asterisk']},
            //' ': { index: 0, emoji: ['small_blue_diamond']}
        };
        this.keys = Object.keys(this.matches);
        this.classesDefault = {
            chat: "chat-3bRxxu",
            searchBar: "searchBar-2_Yu-C",
            messagesWrapper: "messagesWrapper-3lZDfY"
        };
        this.classesNormalized = {
            appMount: "da-appMount",
            chat: "da-chat",
            searchBar: "da-searchBar",
            messagesWrapper: "da-messagesWrapper"
        };
        this.classes = this.classesDefault;
    }
    
    
    load() { this.log('Loaded'); }
    start(){
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

    observer({ addedNodes, removedNodes }) {
        if (!this.classes || !addedNodes || !addedNodes[0] || !addedNodes[0].classList) return;
        let cl = addedNodes[0].classList;

        if (cl.contains(this.classes.searchBar)
            || cl.contains(this.classes.chat)
            || cl.contains(this.classes.messagesWrapper)) {
            this.update();
        }
    }

    initialize(){
        if (this.initialized) return;
        this.initialized = true;

        this.update();

        try {
            PluginUtilities.checkForUpdate(this.getName(), this.getVersion(),
                "https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/Texty.plugin.js");
        }
        catch (err) {
            this.error("Couldn't update plugin.");
        }

        this.log("Initialized");
    }

    stop() {
        $('.' + this.classes.chat + ' textarea').off('keydown.texty');
        this.log('Stopped');
    }

    unload() { this.log('Unloaded'); }

    log(text) {
        return console.log(`[%c${this.getName()}%c] ${text}`,
            'color: #F77; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    error(text) {
        try {
            PluginUtilities.showToast(`[${this.getName()}] Error: ${text}`, {type:'error'});
        }
        catch (err) {}
        return console.error(`[%c${this.getName()}%c] ${text}`,
            'color: #F77; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    // check on switch, in case BD updates emotes file while client is running
    onSwitch() {  }

    update() {
        let textArea = $('.' + this.classes.chat + ' textarea');
        if (!textArea.length) return;

        let inputBox = textArea[0];
        textArea.off('keydown.texty').on('keydown.texty', (e) => {
            // Corrupt text either when we press enter or tab-complete
            if ((e.which == 13 || e.which == 9) && inputBox.value) {
                let cursorPos = inputBox.selectionEnd;
                let value = inputBox.value;
                let tailLen = value.length - cursorPos;
                
                // If we pressed Tab, perform corruption only if the cursor is right after the closing braces.
                if (e.which == 9 && !value.substring(0, inputBox.selectionEnd).endsWith(':'))
                    return;
                // Markup format:
                // t:<text>:
                // text: text to generate emoji from
                let regex = /e\[([\d\s\-a-zA-Z.*!?#]+)\]/g;
                if (regex.test(value)) {
                    value = value.replace(regex, this.doTexty.bind(this));
                    if (value.length > 2000) {
                        PluginUtilities.showToast("This message would exceed the 2000-character limit.\nReduce corruption amount or shorten text.\n\nLength including corruption: " + value.length, {type: 'error'});
                        e.preventDefault();
                        return;
                    }
                    inputBox.focus();
                    inputBox.select();
                    document.execCommand("insertText", false, value);

                    // If we're using tab-completion, keep the cursor position, in case we were in the middle of a line
                    if (e.which == 9) {
                        let newCursorPos = value.length - tailLen;
                        inputBox.setSelectionRange(newCursorPos, newCursorPos);
                    }
                }
            }
        });
        
        this.initialized = true;
    }

    doTexty(match, text, offset, string, isReaction) {
        text = text.toLowerCase();
        let reacts = new Array();
        let reactIdx = 0;
        this.log('text: ' + text);
        for (let e = 0; e < this.keys.length; e++)
            this.matches[this.keys[e]].index = 0;

        let output = '';
        let len = text.length;
        for (let i = 0; i < len; i++) {
            let char = text.substring(i, i+1);
            let pair = text.substring(i, i+2);
            if (isReaction && len-i > 1) {
                let pairEmoji = this.getEmoji(pair, false);
                if (pairEmoji.length > 0) {
                    output += ':' + pairEmoji + ': ';
                    reacts[reactIdx++] = pairEmoji;
                    i++;
                    continue;
                }
            }
            
            if (char == ' ') {
                output += '     ';
                continue;
            }

            let emoji = this.getEmoji(char, false);
            if (emoji.length > 0){
                output += ':' + emoji + ': ';
                reacts[reactIdx++] = emoji;
            }
            else {
                this.log("can't assign emoji to character (too many of this character?): " + char);
                return null;
            }
        }

        return output;
    }

    getEmoji(string, single) {
        let match = this.matches[string]
        if (match) {
            if (single) match.index++;
            let idx = match.index;
            return match.emoji[idx];
        }
        return '';
    }
}

/*@end @*/
