//META{"name":"Zalgo","displayName":"Zalgo","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/Zalgo.plugin.js"}*//
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

var Zalgo = (() => {
    const config = {"info":{"name":"Zalgo","authors":[{"name":"Chami","discord_id":"165709167095578625","github_username":"planetarian","twitter_username":"pir0zhki"}],"version":"0.5.0","description":"Zalgo text generation plugin -- write something {{like this}} to corrupt it l̕i̸̶͜ḱ͟e͏̶͢ ̨̛t̢̛҉̧ḩ͘i͘̕͏́͟ş̸̢͘͏\r\nYou can configure the amount of corruption in settings, or prefix it with a corruption amount:\r\n{{0.01:just a little corrupt}} -> j̨ųs͏t̨ ̷a͘ ̸l̶i̷t̀t҉l͡e҉ ̴c̡o͏r҉ŕu̡p̢t̕\r\nYou can also ramp the corruption amount gradually:\r\n{{r:start at zero and get more corrupted}} -> st̶a̷r̸t͜ ҉a̴t̡ ͘z̢e̵r̵o͡ ͝a̡ńd̡ ̛g͝e͞t͏̷ ͜m͟ó̡r̕͠e̸̴ ҉̨͟c̨̀͢͠ơ̕̕͝͞r̸̵̡͢ŕ̛͞u̧p̨͟͝t̴̶͝e̷̡d͏̴́͡","github":"https://github.com/planetarian/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/Zalgo.plugin.js"},"changelog":[{"title":"0.5.0","items":["Added start and end character customization"]},{"title":"0.4.0","items":["Fixed breakage caused by discord update","Switched from element manipulation to method patching"]},{"title":"0.3.0","items":["Fixed breakage caused by discord update","Switched from locally-tracked classes to use DiscordSelectors"]},{"title":"Plugin revamp","items":["Switched to new plugin format","Switched to new ZeresLib"]}],"main":"index.js"};

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

    return class Zalgo extends Plugin {
        constructor() {
            super();

            this.zalgoUp = [
                '\u030d', /*     ̍     */    '\u030e', /*     ̎     */    '\u0304', /*     ̄     */    '\u0305', /*     ̅     */
                '\u033f', /*     ̿     */    '\u0311', /*     ̑     */    '\u0306', /*     ̆     */    '\u0310', /*     ̐     */
                '\u0352', /*     ͒     */    '\u0357', /*     ͗     */    '\u0351', /*     ͑     */    '\u0307', /*     ̇     */
                '\u0308', /*     ̈     */    '\u030a', /*     ̊     */    '\u0342', /*     ͂     */    '\u0343', /*     ̓     */
                '\u0344', /*     ̈́     */    '\u034a', /*     ͊     */    '\u034b', /*     ͋     */    '\u034c', /*     ͌     */
                '\u0303', /*     ̃     */    '\u0302', /*     ̂     */    '\u030c', /*     ̌     */    '\u0350', /*     ͐     */
                '\u0300', /*     ̀     */    '\u0301', /*     ́     */    '\u030b', /*     ̋     */    '\u030f', /*     ̏     */
                '\u0312', /*     ̒    */    '\u0313', /*     ̓     */    '\u0314', /*     ̔     */    '\u033d', /*     ̽     */
                '\u0309', /*     ̉     */    '\u0363', /*     ͣ    */    '\u0364', /*     ͤ    */    '\u0365', /*     ͥ    */
                '\u0366', /*     ͦ    */    '\u0367', /*     ͧ    */    '\u0368', /*     ͨ    */    '\u0369', /*     ͩ    */
                '\u036a', /*     ͪ    */    '\u036b', /*     ͫ    */    '\u036c', /*     ͬ    */    '\u036d', /*     ͭ    */
                '\u036e', /*     ͮ    */    '\u036f', /*     ͯ    */    '\u033e', /*     ̾     */    '\u035b', /*     ͛     */
                '\u0346', /*     ͆     */    '\u031a'  /*     ̚     */
            ];
            this.zalgoMid = [
                '\u0315', /*     ̕     */    '\u031b', /*     ̛     */    '\u0340', /*     ̀     */    '\u0341', /*     ́     */
                '\u0358', /*     ͘     */    '\u0321', /*     ̡     */    '\u0322', /*     ̢     */    '\u0327', /*     ̧     */
                '\u0328', /*     ̨     */    '\u0334', /*     ̴     */    '\u0335', /*     ̵     */    '\u0336', /*     ̶     */
                '\u034f', /*     ͏     */    '\u035c', /*     ͜     */    '\u035d', /*     ͝     */    '\u035e', /*     ͞     */
                '\u035f', /*     ͟     */    '\u0360', /*     ͠     */    '\u0362', /*     ͢     */    '\u0338', /*     ̸     */
                '\u0337', /*     ̷     */    '\u0361', /*     ͡     */    '\u0489'  /*    ҉_    */
            ];
            this.zalgoDown = [
                '\u0316', /*     ̖     */    '\u0317', /*     ̗     */    '\u0318', /*     ̘     */    '\u0319', /*     ̙     */
                '\u031c', /*     ̜     */    '\u031d', /*     ̝     */    '\u031e', /*     ̞     */    '\u031f', /*     ̟     */
                '\u0320', /*     ̠     */    '\u0324', /*     ̤     */    '\u0325', /*     ̥     */    '\u0326', /*     ̦     */
                '\u0329', /*     ̩     */    '\u032a', /*     ̪     */    '\u032b', /*     ̫     */    '\u032c', /*     ̬     */
                '\u032d', /*     ̭     */    '\u032e', /*     ̮     */    '\u032f', /*     ̯     */    '\u0330', /*     ̰     */
                '\u0331', /*     ̱     */    '\u0332', /*     ̲     */    '\u0333', /*     ̳     */    '\u0339', /*     ̹     */
                '\u033a', /*     ̺     */    '\u033b', /*     ̻     */    '\u033c', /*     ̼     */    '\u0345', /*     ͅ     */
                '\u0347', /*     ͇     */    '\u0348', /*     ͈     */    '\u0349', /*     ͉     */    '\u034d', /*     ͍     */
                '\u034e', /*     ͎     */    '\u0353', /*     ͓     */    '\u0354', /*     ͔     */    '\u0355', /*     ͕     */
                '\u0356', /*     ͖     */    '\u0359', /*     ͙     */    '\u035a', /*     ͚     */    '\u0323'  /*     ̣     */
            ];

            this.defaultSettings = {
                corruptionAmount: 1.0,
                rampEnd: 0.7,
                corruptUp: false,
                corruptMid: true,
                corruptDown: false,
                startCharacters: '{{',
                endCharacters: '}}'
            };
        }

        onStart() {
            Logger.log("Started");
            
            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                let content = a[1].content;
                // Markup format:
                // {{<o/b>,<r><rampEnd>,<startAmount>-<endAmount>:text}}
                // o: obscure
                // b: beneath (don't obscure)
                // r: enable ramping
                // rampEnd: normalized value (0.0-1.0) representing ramp length, requires <r>
                // startAmount: corruption amount at start of ramp; enables ramping even without <r>
                // endamount: corruption amount at end of ramp, or across whole string if no ramp
                // text: text to apply zalgo corruption to
                const escapeSpecial = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const startChars = escapeSpecial(this.settings.startCharacters || '{{');
                const endChars = escapeSpecial(this.settings.endCharacters || '}}');
                const regex = new RegExp(startChars + "(?:(?:(?:(o|b))?,?)?(?:(r)(\d+(?:\.\d+)?)?,?)?(?:(\d+(?:\.\d+)?)-)?(\d+(?:\.\d+)?)?\:)?((?:(?!{{).)*?)" + endChars);
                if (regex.test(content)) {
                    content = content.replace(regex, this.doZalgo.bind(this));
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
            /// Using patch method for now
            //let textArea = this.getChatTextArea();
            //if (textArea) textArea.off("keydown.zalgo");
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.SettingGroup("Zalgo Settings", {collapsible: false, shown: true}).append(
                    new Settings.Slider("Corruption amount", "Adjusts how corrupted your text becomes",
                        0.05, 3.0, this.settings.corruptionAmount, (e) => { this.settings.corruptionAmount = e; }),
                    new Settings.Slider("Ramp end position", "Adjusts the endpoint of the ramp-in when using the `r` prefix",
                        0.05, 1.0, this.settings.rampEnd, e => { this.settings.rampEnd = e; }),
                    new Settings.Switch("Obscure text", "Determines whether zalgo characters are placed over the text or beneath it (use the `o` or `b` prefixes to set this in-line)",
                        this.settings.corruptMid, e => { this.settings.corruptMid = e; }),
                        new Settings.Textbox("Start characters", "Unique characters to mark the start of zalgo text.", this.settings.startCharacters || '{{', e => {this.settings.startCharacters = e;}),
                        new Settings.Textbox("End characters", "Unique characters to mark the end of zalgo text.", this.settings.endCharacters || '}}', e => {this.settings.endCharacters = e;}),
                )
            );
        }
        
        observer({ addedNodes, removedNodes }) {
            /* /// unneeded due to patch method
            if (!this.classes || !addedNodes || !addedNodes[0] || !addedNodes[0].classList) return;
            let node = addedNodes[0];

            let sel = ZLibrary.DiscordSelectors;
            if (node.matches(sel.TitleWrap.chat)
                || node.matches(sel.TitleWrap.chatContent)) {
                this.update();
            }*/
        }

        update() {

            /* /// Using patching for now; tab completion pending further testing
            let textArea = this.getChatTextArea();
            if (!textArea || !textArea.length) return;

            let inputBox = textArea[0];
            Logger.log(inputBox);
            textArea.off("keydown.zalgo").on("keydown.zalgo", (e) => {
                // Corrupt text either when we press enter or tab-complete
                Logger.log(e.which);
                if ((e.which == 13 || e.which == 9) && inputBox.value) {
                    let cursorPos = inputBox.selectionEnd;
                    let value = inputBox.value;
                    let tailLen = value.length - cursorPos;
                    
                    // If we pressed Tab, perform corruption only if the cursor is right after the closing braces.
                    if (e.which == 9 && !value.substring(0, inputBox.selectionEnd).endsWith("}}"))
                        return;
                    // Markup format:
                    // {{<r><rampEnd>,<startAmount>-<endAmount>:text}}
                    // r: enable ramping
                    // rampEnd: normalized value (0.0-1.0) representing ramp length, requires <r>
                    // startAmount: corruption amount at start of ramp; enables ramping even without <r>
                    // endamount: corruption amount at end of ramp, or across whole string if no ramp
                    // text: text to apply zalgo corruption to
                    let regex = /\{\{(?:(?:(r)(\d+(?:\.\d+)?)?,?)?(?:(\d+(?:\.\d+)?)-)?(\d+(?:\.\d+)?)?\:)?((?:(?!{{).)*?)\}\}/g;
                    if (regex.test(value)) {
                        value = value.replace(regex, this.doZalgo.bind(this));
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
            */
            
            this.initialized = true;
        }

        getChatTextArea() {
            return $(".slateTextArea-1bp44y");
            //let sel = ZLibrary.DiscordSelectors;
            //return $(sel.Textarea.channelTextArea.value + " " + sel.Textarea.textArea.value);
        }

        doZalgo(match, midMode, ramp, rampEnd, startAmt, endAmt, contents, offset, string) {
            const maxAmt = 10;
            let hasStart = startAmt >= 0 && startAmt <= maxAmt;
            let hasEnd = endAmt >= 0 && endAmt <= maxAmt;
            let hasRampEnd = rampEnd >= 0 && rampEnd <= 1;

            let corruptMid = midMode == "o" || (midMode != "b" && this.settings.corruptMid);
            let doRamp = ramp == "r" || hasStart;

            if (!hasRampEnd) rampEnd = this.settings.rampEnd;
            // use default end amount if not provided
            if (!hasEnd) endAmt = this.settings.corruptionAmount;
            // set end/start amounts to equal if we're not ramping anyway
            if (!doRamp) startAmt = endAmt;
            // otherwise, start at 0 if we are ramping but no start provided
            else if (!hasStart) startAmt = 0;

            return this.getZalgo(contents, corruptMid, parseFloat(rampEnd), parseFloat(startAmt), parseFloat(endAmt));
        }

        getZalgo(txt, corruptMid, rampEnd, startAmt, endAmt) {
            //============================================================
            // ZALGO text script by tchouky, adapted/modified by Chami
            // See original at http://eeemo.net/
            //============================================================

            // Get saved options for corruption directions
            let config = this.settings;
            let optUp = config.corruptUp;
            let optMid = corruptMid;
            let optDown = config.corruptDown || (!optUp && !optMid);

            let newTxt = "";

            let len = txt.length;
            if (len == 0) return "";

            // Figure out at what index the ramp ends
            let rampEndIndex = len * rampEnd;

            for (var i = 0; i < len; i++) {
                if (this.isZalgoChar(txt.substr(i, 1)))
                    continue;

                // Add the normal character
                newTxt += txt.substr(i, 1);

                // Normalized value (0-1.0) representing our current position within the ramp
                let rampX = rampEndIndex == 0 ? 1 : Math.min(1, i / rampEndIndex);
                // Square the ramp value to ease it in
                rampX = Math.pow(rampX, 4);
                // To determine the final corruption amount at this position
                let rampDiff = rampX * (endAmt - startAmt);
                let amt = startAmt + rampDiff;

                // Modifier of .07 for up/down corruption accounts for the fact that
                // discord only displays a small portion of the characters above/below text
                let upDownMod = 0.07;
                let numUp = amt * (this.rand(64) / 4 + 3) * upDownMod;
                let numMid = amt * (this.rand(16) / 4 + 1);
                let numDown = amt * (this.rand(64) / 4 + 3) * upDownMod;

                // upward zalgo is disabled in current version except through manual config modification
                if (optUp)
                    for (var j = 0; j < numUp; j++)
                        newTxt += this.randZalgo(this.zalgoUp);

                // middle corruption obscures the text itself
                if (optMid)
                    for (var j = 0; j < numMid; j++)
                        newTxt += this.randZalgo(this.zalgoMid);

                // downward corruption begins at the text baseline
                if (optDown)
                    for (var j = 0; j < numDown; j++)
                        newTxt += this.randZalgo(this.zalgoDown);
            }

            // HE COMES
            return newTxt;
        }

        // Gets an int between 0 and max
        rand(max) {
            return Math.floor(Math.random() * max);
        }

        // Gets a random char from a zalgo char table
        randZalgo(array) {
            var ind = Math.floor(Math.random() * array.length);
            return array[ind];
        }

        // Lookup char to know if it's a zalgo char or not
        isZalgoChar(c) {
            var i;
            for (i = 0; i < this.zalgoUp.length; i++)
                if (c == this.zalgoUp[i])
                    return true;
            for (i = 0; i < this.zalgoDown.length; i++)
                if (c == this.zalgoDown[i])
                    return true;
            for (i = 0; i < this.zalgoMid.length; i++)
                if (c == this.zalgoMid[i])
                    return true;
            return false;
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/