import * as influx from 'influx';
// import * as os from 'os';

const Influx = new influx.InfluxDB({
    host: '192.168.8.151',
    database: 'influx',
    schema: [
        {
            measurement: 'modbus',
            fields: {
                current: influx.FieldType.FLOAT,
            },
            tags: ['host']
        }
    ]
});

console.log(Influx)

interface modbus {
    l1Voltage: number,
    l1Current: number,
    l2Voltage: number,
    l2Current: number,
    l3Voltage: number,
    l3Current: number,
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        while (1) {

            Influx.query(`
            select "L1 Voltage", "L1 Current", "L2 Voltage", "L2 Current", "L3 Voltage", "L3 Current", "Grid Frequency", "Power Factor", "Total Apparent Power" from modbus
            order by time desc
            limit 10
          `).then((res: any) => {
                console.log(res[res.length - 1]['L1 Voltage']);
                console.log(res[res.length - 1]['L1 Current']);
                console.log(res[res.length - 1]["L1 Voltage"]);
                console.log(res[res.length - 1]["L1 Current"]);
                console.log(res[res.length - 1]["L2 Voltage"]);
                console.log(res[res.length - 1]["L2 Current"]);
                console.log(res[res.length - 1]["L3 Voltage"]);
                console.log(res[res.length - 1]["L3 Current"]);
                console.log(res[res.length - 1]["Grid Frequency"]);
                console.log(res[res.length - 1]["Power Factor"]);
                console.log(res[res.length - 1]["Total Apparent Power"]);
                const l1Voltage = (Math.round(res[res.length - 1]["L1 Voltage"])).toString();
                const l1Current = (Math.ceil(res[res.length - 1]["L1 Current"] * 10) / 10).toFixed(1);
                const l2Voltage = (Math.round(res[res.length - 1]["L2 Voltage"])).toString();
                const l2Current = (Math.ceil(res[res.length - 1]["L2 Current"] * 10) / 10).toFixed(1);
                const l3Voltage = (Math.round(res[res.length - 1]["L3 Voltage"])).toString();
                const l3Current = (Math.ceil(res[res.length - 1]["L3 Current"] * 10) / 10).toFixed(1);
                const gridFreq = (Math.round(res[res.length - 1]["Grid Frequency"] * 10) / 10).toFixed(1);
                const powerFactor = (Math.round(res[res.length - 1]["Power Factor"])).toString();
                const apparentPower = (Math.round(res[res.length - 1]["Total Apparent Power"])).toString();

                (document.getElementById("l1-voltage") as HTMLDivElement).innerText = l1Voltage;
                (document.getElementById("l1-amperage") as HTMLDivElement).innerText = l1Current;
                (document.getElementById("l2-voltage") as HTMLDivElement).innerText = l2Voltage;
                (document.getElementById("l2-amperage") as HTMLDivElement).innerText = l2Current;
                (document.getElementById("l3-voltage") as HTMLDivElement).innerText = l3Voltage;
                (document.getElementById("l3-amperage") as HTMLDivElement).innerText = l3Current;
                (document.getElementById("grid-freq") as HTMLDivElement).innerText = gridFreq;
                (document.getElementById("power-factor") as HTMLDivElement).innerText = powerFactor;
                (document.getElementById("apparent-power") as HTMLDivElement).innerText = apparentPower;
            })

            await sleep(1000)
        }

    } catch (e) {
        // Deal with the fact the chain failed
    }
})();