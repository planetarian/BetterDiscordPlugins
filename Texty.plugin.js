//META{"name":"Texty","displayName":"Texty","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/Texty.plugin.js"}*//
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

var Texty = (() => {
    const config = {"info":{"name":"Texty","authors":[{"name":"Chami","discord_id":"165709167095578625","github_username":"planetarian","twitter_username":"pir0zhki"}],"version":"0.1.0","description":"An obnoxious plugin that translates e[text] into emoji form.","github":"https://github.com/planetarian/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/Texty.plugin.js"},"changelog":[{"title":"0.1.0","items":["Switched to new plugin format","Switched to new ZeresLib"]}],"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            const title = "Library Missing";
            const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
            const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
            const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
            if (!ModalStack || !ConfirmationModal || !TextElement) return BdApi.alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
            ModalStack.push(function(props) {
                return BdApi.React.createElement(ConfirmationModal, Object.assign({
                    header: title,
                    children: [BdApi.React.createElement(TextElement, {color: TextElement.Colors.PRIMARY, children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]})],
                    red: false,
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                            if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                            await new Promise(r => require("fs").writeFile(require("path").join(ContentManager.pluginsFolder, "0PluginLibrary.plugin.js"), body, r));
                        });
                    }
                }, props));
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

    const { Logger, DiscordModules, Patcher, Settings } = Library;

    return class Texty extends Plugin {
        constructor() {
            super();

            this.defaultSettings = {
                startCharacters: 'e[',
                endCharacters: ']'
            };

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
        }

        onStart() {
            Logger.log("Started");
            
            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                let content = a[1].content;
                const escapeSpecial = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const startChars = escapeSpecial(this.settings.startCharacters || 'e[');
                const endChars = escapeSpecial(this.settings.endCharacters || ']');
                const regex = new RegExp(startChars + "(.*?)" + endChars);
                if (regex.test(content)) {
                    content = content.replace(regex, this.doTexty.bind(this));
                    if (content.length > 2000) {
                        PluginUtilities.showToast("This message would exceed the 2000-character limit.\nReduce corruption amount or shorten text.\n\nLength including corruption: " + value.length, {type: 'error'});
                        e.preventDefault();
                        return;
                    }
                    a[1].content = content;
                }
            });

            this.update();
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.SettingGroup("Texty Settings", {collapsible: false, shown: true}).append(
                    new Settings.Textbox("Start characters", "Unique characters to mark the start of text to replace.", this.settings.startCharacters || 'e[', e => {this.settings.startCharacters = e;}),
                    new Settings.Textbox("End characters", "Unique characters to mark the end of text to replace.", this.settings.endCharacters || ']', e => {this.settings.endCharacters = e;}),
                )
            );
        }

        update() {
            this.initialized = true;
        }
        
        doTexty(match, text, offset, string, isReaction) {
            text = text.toLowerCase();
            let reacts = new Array();
            let reactIdx = 0;
            Logger.log('text: ' + text);
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
                    Logger.log("can't assign emoji to character (too many of this character?): " + char);
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
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/