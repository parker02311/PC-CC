import * as DataStore from '/js/common/core/DataStore.js';
import * as Engine from '/js/common/core/Engine.js';
import * as Input from '/js/common/core/Input.js';
import * as Localisation from '/js/common/core/Localisation.js';
import * as Player from '/js/common/core/Player.js';
import * as System from '/js/common/core/System.js';
import { loadDebugDefaultTools } from '/js/common/debug/DebugToolImports.js';
import * as preact from '/js/common/lib/preact.js';
import { loadCSS } from '/js/common/util/CSSUtil.js';
import * as Format from '/js/common/util/LocalisationUtil.js';
import * as FontConfig from '/js/config/FontConfig.js';
import { Button } from '/js/project/components/Button.js';
import { ManagementMenuButton } from '/js/project/modules/managementMenu/ManagementMenuButton.js';
import { classNames } from '/js/common/lib/classnames.js';
FontConfig;
Engine.initialiseSystems([
    { system: Engine.Systems.System, initialiser: System.attachToEngineReadyForSystem },
    { system: Engine.Systems.DataStore, initialiser: DataStore.attachToEngineReadyForSystem },
    { system: Engine.Systems.Input, initialiser: Input.attachToEngineReadyForSystem },
    { system: Engine.Systems.Localisation, initialiser: Localisation.attachToEngineReadyForSystem },
    { system: Engine.Systems.Player, initialiser: Player.attachToEngineReadyForSystem },
]);
Engine.whenReady.then(async () => {
    await loadCSS('project/Shared');
    await loadDebugDefaultTools();

    preact.render(preact.h(Importer, null), document.body);
    Engine.sendEvent('OnReady');
}).catch(Engine.defaultCatch);
class Importer extends preact.Component {
    static defaultProps = {
        moduleName: 'Importer',
    };
    state = {
        visible: true,
        buttonShow: false,
    };
    componentWillMount() {
        Engine.addListener('Show', this.onShow);
        Engine.addListener('Hide', this.onHide);
        Engine.addListener('SetButtonsShow', this.setButtonShow);
    }
    componentWillUnmount() {
        Engine.removeListener('Show', this.onShow);
        Engine.removeListener('Hide', this.onHide);
        Engine.removeListener('SetButtonsShow', this.setButtonShow);
    }
    render(props, state) {
        return (preact.h("div", { className: 'ImporterMenu_root' },
            preact.h("div", { className: classNames('ImporterMenu_content', { hide: !state.visible }) },
                preact.h(ManagementMenuButton, { src: 'img/icons/coaster.svg', onSelect: () => Engine.sendEvent('ImporterImport'), toggleable: false, focused: false, tooltip: Format.stringLiteral('PC:CC') })
            ),
            preact.h("div", { className: classNames('ImporterMenu_buttons', { hide: !state.buttonShow }) },
                preact.h(Button, { rootClassName: 'positive', label: Format.stringLiteral('Confirm Import'), onSelect: () => Engine.sendEvent('ImporterAccept') }),
                preact.h(Button, { rootClassName: 'negative', label: Format.stringLiteral('Cancel Import'), onSelect: () => Engine.sendEvent('ImporterCancel') })
            )
        ))
    }
    setButtonShow = (show) => {
        this.setState({ buttonShow: show });
    };
    onShow = () => {
        this.setState({ visible: true });
    };
    onHide = () => {
        this.setState({ visible: false });
    };
}