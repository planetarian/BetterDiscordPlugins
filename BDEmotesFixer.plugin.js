//META{"name":"BDEmotesFixer","website":"https://github.com/planetarian/BetterDiscordPlugins"}*//

class BDEmotesFixer {
    getName() { return "BDEmotesFixer"; }
    getDescription() { return "Fixes BD so that FFZ emotes once again take priority over BTTV emotes. Get your Klappa on."; }
    getVersion() { return "0.0.1"; }
    getAuthor() { return "Chami"; }
    getSettingsPanel() { return "<h3>BDEmotesFixer Settings</h3>"; }

    constructor() {
    }
    
    load(){}
    start(){}
    stop(){}
    unload(){}

    // check on switch, in case BD updates emotes file while client is runningj
    onSwitch() {
        let ffz = window.bdEmotes.FrankerFaceZ;
        if (ffz && ffz.Klappa && ffz.Klappa.startsWith('https://cdn.frankerfacez.com/')) {
            window.bdEmotes.FrankerFaceZ = window.bdEmotes.BTTV2;
            window.bdEmotes.BTTV2 = ffz;
        }
    }

}
