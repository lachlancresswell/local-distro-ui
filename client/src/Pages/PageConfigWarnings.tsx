// src/components/ConfigForm.tsx
import { Neighbour, WarningsOptions } from '../../../Types';
import '../Styles/PageConfigWarnings.css';
import { useConfig } from '../Hooks/useConfig';

export const WarningSettings = () => {
    const { pluginConfig, selectedNeighbour, handleInputChange } = useConfig<WarningsOptions>('warnings');

    const isChecked = pluginConfig?.enable.value as boolean;

    return (
        <div className="gridWarnings">
            <div className={`span-two-warnings`}>
                <div className='warnings-traffic-lights'>
                    <div className='warnings-traffic-lights-red' />
                    <div className='warnings-traffic-lights-orange' />
                    <div className='warnings-traffic-lights-green' />
                </div>
            </div>
            <div className={`span-four-warnings displaySwitch`}>
                <label className="switch">
                    <input type="checkbox" checked={isChecked} onChange={(e) => handleInputChange('enable', e.target.checked, true)} />
                    <span className="slider round">
                        <span className="switch-on">{isChecked ? 'ON' : ''}</span>
                        <span className="switch-off">{!isChecked ? 'OFF' : ''}</span>
                    </span>
                </label>
            </div>
            <div className={`span-four-warnings`}>
                <div className={`warnings-reset-button`}>
                    RESET
                </div>
            </div>
            <SetMax str1='V' str2='SET' />
            <Value value={pluginConfig?.vSet.value} modifierValues={[5, -10]} />
            <SetMax str1='A' str2='MAX' />
            <Value value={pluginConfig?.amax.value} />
            <SetMax str1='HZ' str2='SET' />
            <Value value={pluginConfig?.HZset.value} modifierValues={[1, -1]} />
        </div>
    )
}

const SetMax = ({ str1, str2 }: { str1: string, str2: string }) => {
    return (
        <div className={`span-four-warnings warnings-width-100`}>
            <div className={`warnings-settings-name`}>
                <span className='warnings-v-a-hz'>{str1}</span>
                <span className='warnings-set-max'>{str2}</span>
            </div>
        </div>);
}

const Value = ({ value, modifierValues }: { value?: number | string, modifierValues?: number[] }) => {
    return (
        <div className={`span-four-warnings warnings-width-100`}>
            <div className='warnings-value'>
                {value}
            </div>
            {modifierValues?.map((mod) => {
                return (<div className='warnings-modifier'>
                    {mod >= 0 ? '+' + mod : mod}
                </div>)
            })}
        </div>
    )
}