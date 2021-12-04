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

let Zalgo = (() => {
  const config = {
    "info": {
      "name": "Zalgo",
      "authors": [{
        "name": "Chami",
        "discord_id": "165709167095578625",
        "github_username": "planetarian",
        "twitter_username": "pir0zhki"
      }],
      "version": "0.5.0",
      "description": "Zalgo text generation plugin -- write something {{like this}} to corrupt it l̕i̸̶͜ḱ͟e͏̶͢ ̨̛t̢̛҉̧ḩ͘i͘̕͏́͟ş̸̢͘͏\r\nYou can configure the amount of corruption in settings, or prefix it with a corruption amount:\r\n{{0.01:just a little corrupt}} -> j̨ųs͏t̨ ̷a͘ ̸l̶i̷t̀t҉l͡e҉ ̴c̡o͏r҉ŕu̡p̢t̕\r\nYou can also ramp the corruption amount gradually:\r\n{{r:start at zero and get more corrupted}} -> st̶a̷r̸t͜ ҉a̴t̡ ͘z̢e̵r̵o͡ ͝a̡ńd̡ ̛g͝e͞t͏̷ ͜m͟ó̡r̕͠e̸̴ ҉̨͟c̨̀͢͠ơ̕̕͝͞r̸̵̡͢ŕ̛͞u̧p̨͟͝t̴̶͝e̷̡d͏̴́͡",
      "github": "https://github.com/planetarian/BetterDiscordPlugins",
      "github_raw": "https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/Zalgo.plugin.js"
    },
    "changelog": [{
      "title": "0.5.0",
      "items": ["Added new text transformers: cursive (𝓽𝓮𝓼𝓽), goth (𝖙𝖊𝖘𝖙), flipped (ʇǝsʇ), small (ᵗᵉˢᵗ), and mirrored (ƚɘꙅƚ) ",
      "To use them, simply set the transformation mode to the first letter of the transform you want to use. For example, cursive: {{c:test}}"]
    },{
      "title": "0.4.0",
      "items": ["Fixed breakage caused by discord update", "Switched from element manipulation to method patching"]
    }, {
      "title": "0.3.0",
      "items": ["Fixed breakage caused by discord update", "Switched from locally-tracked classes to use DiscordSelectors"]
    }, {"title": "Plugin revamp", "items": ["Switched to new plugin format", "Switched to new ZeresLib"]}],
    "main": "index.js"
  };

  return !global.ZeresPluginLibrary ? class {
    constructor() {
      this._config = config;
    }

    getName() {
      return config.info.name;
    }

    getAuthor() {
      return config.info.authors.map(a => a.name).join(", ");
    }

    getDescription() {
      return config.info.description;
    }

    getVersion() {
      return config.info.version;
    }

    load() {
      const title = "Library Missing";
      const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
      const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
      const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() === "confirm-modal");
      if (!ModalStack || !ConfirmationModal || !TextElement) return BdApi.alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
      ModalStack.push(function (props) {
        return BdApi.React.createElement(ConfirmationModal, Object.assign({
          header: title,
          children: [BdApi.React.createElement(TextElement, {
            color: TextElement.Colors.PRIMARY,
            children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]
          })],
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

    start() {
    }

    stop() {
    }
  } : (([Plugin, Api]) => {
    const plugin = (Plugin, Library) => {

      const {Logger, DiscordModules, Patcher, Settings} = Library;

      return class Zalgo extends Plugin {
        // noinspection NonAsciiCharacters
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


          this.gothCharMap = {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝖆","b":"𝖇","c":"𝖈","d":"𝖉","e":"𝖊","f":"𝖋","g":"𝖌","h":"𝖍","i":"𝖎","j":"𝖏","k":"𝖐","l":"𝖑","m":"𝖒","n":"𝖓","o":"𝖔","p":"𝖕","q":"𝖖","r":"𝖗","s":"𝖘","t":"𝖙","u":"𝖚","v":"𝖛","w":"𝖜","x":"𝖝","y":"𝖞","z":"𝖟","A":"𝕬","B":"𝕭","C":"𝕮","D":"𝕯","E":"𝕰","F":"𝕱","G":"𝕲","H":"𝕳","I":"𝕴","J":"𝕵","K":"𝕶","L":"𝕷","M":"𝕸","N":"𝕹","O":"𝕺","P":"𝕻","Q":"𝕼","R":"𝕽","S":"𝕾","T":"𝕿","U":"𝖀","V":"𝖁","W":"𝖂","X":"𝖃","Y":"𝖄","Z":"𝖅"};
          this.cursiveCharMap = {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝓪","b":"𝓫","c":"𝓬","d":"𝓭","e":"𝓮","f":"𝓯","g":"𝓰","h":"𝓱","i":"𝓲","j":"𝓳","k":"𝓴","l":"𝓵","m":"𝓶","n":"𝓷","o":"𝓸","p":"𝓹","q":"𝓺","r":"𝓻","s":"𝓼","t":"𝓽","u":"𝓾","v":"𝓿","w":"𝔀","x":"𝔁","y":"𝔂","z":"𝔃","A":"𝓐","B":"𝓑","C":"𝓒","D":"𝓓","E":"𝓔","F":"𝓕","G":"𝓖","H":"𝓗","I":"𝓘","J":"𝓙","K":"𝓚","L":"𝓛","M":"𝓜","N":"𝓝","O":"𝓞","P":"𝓟","Q":"𝓠","R":"𝓡","S":"𝓢","T":"𝓣","U":"𝓤","V":"𝓥","W":"𝓦","X":"𝓧","Y":"𝓨","Z":"𝓩"};
          this.smallCharMap = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","a":"ᵃ","b":"ᵇ","c":"ᶜ","d":"ᵈ","e":"ᵉ","f":"ᶠ","g":"ᵍ","h":"ʰ","i":"ⁱ","j":"ʲ","k":"ᵏ","l":"ˡ","m":"ᵐ","n":"ⁿ","o":"ᵒ","p":"ᵖ","q":"q","r":"ʳ","s":"ˢ","t":"ᵗ","u":"ᵘ","v":"ᵛ","w":"ʷ","x":"ˣ","y":"ʸ","z":"ᶻ","A":"ᴬ","B":"ᴮ","C":"ᶜ","D":"ᴰ","E":"ᴱ","F":"ᶠ","G":"ᴳ","H":"ᴴ","I":"ᴵ","J":"ᴶ","K":"ᴷ","L":"ᴸ","M":"ᴹ","N":"ᴺ","O":"ᴼ","P":"ᴾ","Q":"Q","R":"ᴿ","S":"ˢ","T":"ᵀ","U":"ᵁ","V":"ⱽ","W":"ᵂ","X":"ˣ","Y":"ʸ","Z":"ᶻ","+":"⁺","-":"⁻","=":"⁼","(":"⁽",")":"⁾"};
          this.mirroredCharMap = {'a':'ɒ','b':'d','c':'ɔ','e':'ɘ','f':'Ꮈ','g':'ǫ','h':'ʜ','j':'ꞁ','k':'ʞ','l':'|','n':'ᴎ','p':'q','r':'ɿ','s':'ꙅ','t':'ƚ','y':'ʏ','z':'ƹ','B':'ᙠ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'ꟻ','G':'Ꭾ','J':'Ⴑ','K':'⋊','L':'⅃','N':'Ͷ','P':'ꟼ','Q':'Ọ','R':'Я','S':'Ꙅ','Z':'Ƹ','1':'','2':'','3':'','4':'','5':'','6':'','7':'','&':'',';':'','[':']','(':')','{':'}','?':'⸮','<':'>','ä':'ɒ'+'\u0308','ß':'ᙠ','´':'`','é':'ɘ'+'\u0300','á':'ɒ'+'\u0300','ó':'ò','ú':'ù','É':'Ǝ'+'\u0300','Á':'À','Ó':'Ò','Ú':'Ù','`':'´','è':'ɘ'+'\u0301','à':'ɒ'+'\u0301','È':'Ǝ'+'\u0301','ê':'ɘ'+'\u0302','â':'ɒ'+'\u0302','Ê':'Ǝ'+'\u0302','Ø':'ᴓ','ø':'ᴓ'};
          this.flipCharMap = {'a':'\u0250','b':'q','c':'\u0254','d':'p','e':'\u01DD','f':'\u025F','g':'\u0253','h':'\u0265','i':'\u0131','j':'\u027E','k':'\u029E','l':'\u006C','m':'\u026F','n':'u','r':'\u0279','t':'\u0287','v':'\u028C','w':'\u028D','y':'\u028E','A':'\u2200','B':'ᙠ','C':'\u0186','D':'ᗡ','E':'\u018e','F':'\u2132','G':'\u2141','J':'\u017f','K':'\u22CA','L':'\u02e5','M':'W','P':'\u0500','Q':'\u038C','R':'\u1D1A','T':'\u22a5','U':'\u2229','V':'\u039B','Y':'\u2144','1':'\u21c2','2':'\u1105','3':'\u0190','4':'\u3123','5':'\u078e','6':'9','7':'\u3125','&':'\u214b','.':'\u02D9','"':'\u201e',';':'\u061b','[':']','(':')','{':'}','?':'\u00BF','!':'\u00A1',"\'":',','<':'>','\u203E':'_','\u00AF':'_','\u203F':'\u2040','\u2045':'\u2046','\u2234':'\u2235','\r':'\n','ß':'ᙠ','\u0308':'\u0324','ä':'ɐ'+'\u0324','ö':'o'+'\u0324','ü':'n'+'\u0324','Ä':'\u2200'+'\u0324','Ö':'O'+'\u0324','Ü':'\u2229'+'\u0324','´':'\u0317','é':'\u01DD'+'\u0317','á':'\u0250'+'\u0317','ó':'o'+'\u0317','ú':'n'+'\u0317','É':'\u018e'+'\u0317','Á':'\u2200'+'\u0317','Ó':'O'+'\u0317','Ú':'\u2229'+'\u0317','`':'\u0316','è':'\u01DD'+'\u0316','à':'\u0250'+'\u0316','ò':'o'+'\u0316','ù':'n'+'\u0316','È':'\u018e'+'\u0316','À':'\u2200'+'\u0316','Ò':'O'+'\u0316','Ù':'\u2229'+'\u0316','^':'\u032E','ê':'\u01DD'+'\u032e','â':'\u0250'+'\u032e','ô':'o'+'\u032e','û':'n'+'\u032e','Ê':'\u018e'+'\u032e','Â':'\u2200'+'\u032e','Ô':'O'+'\u032e','Û':'\u2229'+'\u032e'};

          this.defaultSettings = {
            corruptionAmount: 1.0,
            rampEnd: 0.7,
            corruptUp: false,
            corruptMid: true,
            corruptDown: false
          };
        }

        onStart() {
          Logger.log("Started patching sendMessage");

          Patcher.before(DiscordModules.MessageActions, "sendMessage", (t, a) => {
            let content = a[1].content;
            // Markup format:
            // {{<o/b/c/g/f/s/m>,<r><rampEnd>,<startAmount>-<endAmount>:text}}
            // transformation mode, with text "test" (IDEs tend to render this differently than discord):
            //    o: obscure ( t́͟͢e̕͏͝s̴͢t̶͝)
            //    b: beneath (don't obscure) (t̟͍e̮s͇̟t̜)
            //    c: cursive (𝓽𝓮𝓼𝓽)
            //    g: goth (𝖙𝖊𝖘𝖙)
            //    f: flipped (ʇǝsʇ)
            //    t: tiny (ᵗᵉˢᵗ)
            //    m: mirrored (ƚɘꙅƚ)
            //    s: spongebob case (tEsT)
            // r: enable ramping
            // rampEnd: normalized value (0.0-1.0) representing ramp length, requires <r>
            // startAmount: corruption amount at start of ramp; enables ramping even without <r>
            // endamount: corruption amount at end of ramp, or across whole string if no ramp
            // text: text to apply zalgo corruption to
            const regex = /\{\{(?:(?:([obucgftms])?,?)?(?:(r)(\d+(?:\.\d+)?)?,?)?(?:(\d+(?:\.\d+)?)-)?(\d+(?:\.\d+)?)?:)?((?:(?!{{).)*?)}}/gsi;
            if (regex.test(content)) {
              content = content.replace(regex, this.doTransform.bind(this));
              if (content.length > 2000) {
                PluginUtilities.showToast("This message would exceed the 2000-character limit.\nReduce corruption amount or shorten text.\n\nLength including corruption: " + content.length, {type: 'error'});
                return;
              }
              a[1].content = content;
            }
          });
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
                0.05, 3.0, this.settings.corruptionAmount, (e) => {
                  this.settings.corruptionAmount = e;
                }),
              new Settings.Slider("Ramp end position", "Adjusts the endpoint of the ramp-in when using the `r` prefix",
                0.05, 1.0, this.settings.rampEnd, e => {
                  this.settings.rampEnd = e;
                }),
              new Settings.Switch("Obscure text", "Determines whether zalgo characters are placed over the text or beneath it (use the `o` or `b` prefixes to set this in-line)",
                this.settings.corruptMid, e => {
                  this.settings.corruptMid = e;
                })
            )
          );
        }


        doTransform(match, midMode, ramp, rampEnd, startAmt, endAmt, contents, _offset, _string) {
          const maxAmt = 10;
          if (midMode) midMode = midMode.toLowerCase();
          switch (midMode) {
            case "c":
              return this.charMapSub(this.cursiveCharMap, contents);
            case "g":
              return this.charMapSub(this.gothCharMap, contents);
            case "f":
              return this.charMapSub(this.flipCharMap, contents);
            case "t":
              return this.charMapSub(this.smallCharMap, contents);
            case "m":
              return this.charMapSub(this.mirroredCharMap, contents);
            case "s":
              return this.getMocking(contents);
          }
          let hasStart = startAmt >= 0 && startAmt <= maxAmt;
          let hasEnd = endAmt >= 0 && endAmt <= maxAmt;
          let hasRampEnd = rampEnd >= 0 && rampEnd <= 1;

          let corruptMid = midMode === "o" || (midMode !== "b" && this.settings.corruptMid);
          let doRamp = ramp === "r" || hasStart;

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
          if (len === 0) return "";

          // Figure out at what index the ramp ends
          let rampEndIndex = len * rampEnd;

          for (let i = 0; i < len; i++) {
            if (this.isZalgoChar(txt.substr(i, 1)))
              continue;

            // Add the normal character
            newTxt += txt.substr(i, 1);

            // Normalized value (0-1.0) representing our current position within the ramp
            let rampX = rampEndIndex === 0 ? 1 : Math.min(1, i / rampEndIndex);
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
              for (let j = 0; j < numUp; j++)
                newTxt += this.randZalgo(this.zalgoUp);

            // middle corruption obscures the text itself
            if (optMid)
              for (let j = 0; j < numMid; j++)
                newTxt += this.randZalgo(this.zalgoMid);

            // downward corruption begins at the text baseline
            if (optDown)
              for (let j = 0; j < numDown; j++)
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
          return array[this.rand(array.length)];
        }

        // Lookup char to know if it's a zalgo char or not
        isZalgoChar(c) {
          for (let i = 0; i < this.zalgoUp.length; i++)
            if (c === this.zalgoUp[i]) return true;
          for (let i = 0; i < this.zalgoDown.length; i++)
            if (c === this.zalgoDown[i]) return true;
          for (let i = 0; i < this.zalgoMid.length; i++)
            if (c === this.zalgoMid[i]) return true;
          return false;
        }

        getMocking(text) {
          let transformed = text.slice(0, 1);
          let flipper = true;
          for (let c of text.slice(1).split("")) {
            transformed += flipper ? c.toUpperCase() : c.toLowerCase();
            flipper = !flipper;
          }
          return transformed;
        }

        charMapSub(cMap, text) {
          let out = "";
          for (let c of text.split("")) {
            out += cMap[c] || cMap[c.toLowerCase()] || c;
          }
          return out;
        }
      };

    };
    return plugin(Plugin, Api);
  })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
