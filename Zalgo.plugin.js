//META{"name":"Zalgo","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/Zalgo.plugin.js"}*//

class Zalgo {
    getName() { return "Zalgo"; }
    getDescription() {
        return "Zalgo text generation plugin -- write something {{like this}} to corrupt it " + this.getZalgo("like this",1,1,1) + "\r\n"
            + "You can configure the amount of corruption, or prefix it with a corruption amount:\r\n"
            + "    {{0.1:just a little corrupt}} -> " + this.getZalgo("just a little corrupt",1,0.1,0.1) + "\r\n"
            + "You can also ramp the corruption amount gradually:\r\n"
            + "    {{r:start at zero and get more corrupted}} -> " + this.getZalgo("start at zero and get more corrupted",1,0,3);
    }
    getVersion() { return "0.0.1"; }
    getAuthor() { return "Chami"; }
    getSettingsPanel() { return "<h3>Zalgo Settings</h3>"; }

    constructor() {
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
        this.zalgoMid = [
            '\u0315', /*     ̕     */    '\u031b', /*     ̛     */    '\u0340', /*     ̀     */    '\u0341', /*     ́     */
            '\u0358', /*     ͘     */    '\u0321', /*     ̡     */    '\u0322', /*     ̢     */    '\u0327', /*     ̧     */
            '\u0328', /*     ̨     */    '\u0334', /*     ̴     */    '\u0335', /*     ̵     */    '\u0336', /*     ̶     */
            '\u034f', /*     ͏     */    '\u035c', /*     ͜     */    '\u035d', /*     ͝     */    '\u035e', /*     ͞     */
            '\u035f', /*     ͟     */    '\u0360', /*     ͠     */    '\u0362', /*     ͢     */    '\u0338', /*     ̸     */
            '\u0337', /*     ̷     */    '\u0361', /*     ͡     */    '\u0489'  /*    ҉_    */    
        ];
        this.defaultSettings = {
            Zalgo: {
                corruptionAmount: 0.5,
                rampEnd: 1.0,
                corruptUp: false, // hidden
                corruptMid: true,
                corruptDown: false // hidden
            }
        };
        this.settings = this.defaultSettings;
    }
    
    loadSettings() {
        this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
    }

    saveSettings() {
        PluginUtilities.saveSettings(this.getName(), this.settings);
    }

    // Called when the plugin is loaded in to memory
    load() { this.log('Loaded'); }

    // Called when the plugin is activated (including after reloads)
    start() {
        this.log('Started');
        this.initialize();
    }

    // Called when the plugin is deactivated
    stop() {
        $('.chat textarea').off('keydown.zalgo');
        this.log('Stopped');
    }

    unload() { this.log('Unloaded'); }

    log(text) {
        return console.log(`[%c${this.getName()}%c] ${text}`,
            'color: #F77; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    observer({ addedNodes, removedNodes }) {
        if(addedNodes && addedNodes[0] && addedNodes[0].classList
            && addedNodes[0].classList.contains('messages-wrapper')) {
            this.initialize();
        }
    }

    initialize() {
        this.loadSettings();

        let textArea = $('.chat textarea');
        if (!textArea.length) return;

        let inputBox = textArea[0];
        textArea.off('keydown.zalgo').on('keydown.zalgo', (e) => {
            if (e.which == 13 && inputBox.value) {
                let value = inputBox.value;
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
                    inputBox.focus();
                    inputBox.select();
                    document.execCommand("insertText", false, value);
                }
            }
        });
        
        this.initialized = true;
    }

    doZalgo(match, ramp, rampEnd, startAmt, endAmt, contents, offset, string) {
        const maxAmt = 10;
        let hasStart = startAmt >= 0 && startAmt <= maxAmt;
        let hasEnd = endAmt >= 0 && endAmt <= maxAmt;
        let hasRampEnd = rampEnd >= 0 && rampEnd <= 1;
        let doRamp = ramp == 'r' || hasStart;

        if (!hasRampEnd) rampEnd = this.settings.Zalgo.rampEnd;
        // use default end amount if not provided
        if (!hasEnd) endAmt = this.settings.Zalgo.corruptionAmount;
        // set end/start amounts to equal if we're not ramping anyway
        if (!doRamp) startAmt = endAmt;
        // otherwise, start at 0 if we are ramping but no start provided
        else if (!hasStart) startAmt = 0;

        return this.getZalgo(contents, parseFloat(rampEnd), parseFloat(startAmt), parseFloat(endAmt));
    }

    
    // Called when a message is received
    onMessage() {}

    // Called when a server or channel is switched
    onSwitch() { this.initialize(); }

    getSettingsPanel() {
        var panel = $("<form>").addClass("form").css("width", "100%");
        this.generateSettings(panel);
        return panel[0];
    }

    generateSettings(panel) {
        new PluginSettings.ControlGroup("Settings", () => {
            this.saveSettings();
        }, {
            shown: true
        }).appendTo(panel).append(
            new PluginSettings.Slider("Corruption amount", "adjust how corrupted your text becomes", 0.05, 3.0, 0.05,
                this.settings.Zalgo.corruptionAmount, (val) => { this.settings.Zalgo.corruptionAmount = val;})
            , new PluginSettings.Slider("Ramp end position", "adjust the endpoint of the ramp-in when using the `r` prefix", 0.05, 1.0, 0.05,
                this.settings.Zalgo.rampEnd, (val) => { this.settings.Zalgo.rampEnd = val;})
            // Changing these to a single mid/lower option because discord screws it up when you do multiple at once
            //, new PluginSettings.Checkbox("Corrupt upward", "",
                //this.settings.Zalgo.corruptUp, (checked) => { this.settings.Zalgo.corruptUp = checked;}),
            , new PluginSettings.Checkbox("Obscure", "determines whether zalgo characters are placed over the text or beneath it",
                this.settings.Zalgo.corruptMid, (checked) => { this.settings.Zalgo.corruptMid = checked;})
            //, new PluginSettings.Checkbox("Corrupt downward", "",
                //this.settings.Zalgo.corruptDown, (checked) => { this.settings.Zalgo.corruptDown = checked;})
        );
    }

    getZalgo(txt, rampEnd, startAmt, endAmt) {
        //============================================================
        // ZALGO text script by tchouky, adapted/modified by Chami
        // See original at http://eeemo.net/
        //============================================================

        // Get saved options for corruption directions
        let optUp = this.settings.Zalgo.corruptUp;
        let optMid = this.settings.Zalgo.corruptMid;
        let optDown = this.settings.Zalgo.corruptDown || (!optUp && !optMid);
        
        let newTxt = '';

        let len = txt.length;
        if (len == 0) return '';

        // Figure out at what index the ramp ends
        let rampEndIndex = len * rampEnd;
        
        for(var i = 0; i < len; i++)
        {
            if(this.isZalgoChar(txt.substr(i, 1)))
                continue;
            
            // Add the normal character
            newTxt += txt.substr(i, 1);

            // Normalized value (0-1.0) representing our current position within the ramp
            let rampX = rampEndIndex == 0 ? 1 : Math.min(1, i / rampEndIndex);
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
                for(var j = 0; j < numUp; j++)
                    newTxt += this.randZalgo(this.zalgoUp);

            // middle corruption obscures the text itself
            if (optMid)
                for(var j = 0; j < numMid; j++)
                    newTxt += this.randZalgo(this.zalgoMid);

            // downward corruption begins at the text baseline
            if (optDown)
                for(var j = 0; j < numDown; j++)
                    newTxt += this.randZalgo(this.zalgoDown);
        }

        // HE COMES
        return newTxt;
    }
    
    // Gets an int between 0 and max
    rand(max)
    {
        return Math.floor(Math.random() * max);
    }

    // Gets a random char from a zalgo char table
    randZalgo(array)
    {
        var ind = Math.floor(Math.random() * array.length);
        return array[ind];
    }
    
    // Lookup char to know if it's a zalgo char or not
    isZalgoChar(c)
    {
        var i;
        for(i = 0; i < this.zalgoUp.length; i++)
            if(c == this.zalgoUp[i])
                return true;
        for(i = 0; i < this.zalgoDown.length; i++)
            if(c == this.zalgoDown[i])
                return true;
        for(i = 0; i < this.zalgoMid.length; i++)
            if(c == this.zalgoMid[i])
                return true;
        return false;
    }
    
}
