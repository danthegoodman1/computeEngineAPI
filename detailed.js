const zone = compute.zone('us-east1-b')

console.log('starting')
const clusterKey = makeAPIKey()
console.log(clusterKey)
let returnObj = {}
const i = 0
// TODO: Log clusterData into firestore somewhere (or at least node names, cluster name, cluster key)
// for (i = 0; i < clusterData.numNodes; i++) { // Always do master first
const name = `hids-${clusterData.clientName}-node${i}`
const config = {
    // os: 'ubuntu', // FIXME: Does this need to be here if we specify custom image?
    http: true,
    https: true,
    machineType: 'n1-standard-1', // TODO: Configure machine Type
    tags: [
        'wazuh',
        `hids-${clusterData.clientName}`,
        'hids',
        clusterData.clientName,
        'http-server',
        'https-server'
    ],
    'disks': [
        {
            'kind': 'compute#attachedDisk',
            'type': 'PERSISTENT',
            'boot': true,
            'mode': 'READ_WRITE',
            'autoDelete': true,
            'deviceName': name,
            'initializeParams': {
                'sourceImage': 'projects/security-products-main/global/images/hids-master-image',
                'diskType': 'projects/security-products-main/zones/us-east1-b/diskTypes/pd-standard',
                'diskSizeGb': clusterData.diskSize
            }
        }
    ],
}
zone.createVM(name, config)
.then(() => {
    console.log('created')
    return zone.vm(name).getMetadata()
})
.then((data) => {
    console.log('get meta')
    returnObj[`${name}_ip`] = data[0].networkInterfaces[0].accessConfigs[0].natIP
    if (i == 0){
        returnObj.masterNodeIP = data[0].networkInterfaces[0].accessConfigs[0].natIP
    }
    const setMeta = {
        'node-config': JSON.stringify({
            clusterName: clusterData.clusterName,
            nodeName: name,
            nodeType: ((i==0) ? 'master' : 'worker'),
            key: clusterKey,
            masterNodeIP: returnObj.masterNodeIP,
            clientName: clusterData.clientName,
            clientKibanaPassword: clusterData.clientKibanaPassword // TODO: Add this to requqest
        }),
        'first-config': JSON.stringify({
            apiKey: clusterData.apiKey,
            uid: clusterData.uid,
            elkServer: clusterData.elkServer
        })
    }
    return zone.vm(name).setMetadata(setMeta)
})
.then(() => {
    console.log('set meta')
    console.log(`Launched ${clusterData.clientName}'s hids cluster with info: ${JSON.stringify(clusterData)}`)
    const fireWallObj = {
        protocols: {
            tcp: [1516, 1514, 5002, 55000], // TODO: figure out the ports that need to be open
            udp: [1514]
        },
        tags: [
            'http-server', // TODO: DO we need these 2 tags?
            'https-server',
            'hids-firewall',
            'hids'
        ]
    }
    return compute.createFirewall('hids-firewall', fireWallObj)
})
.then(() => {
    console.log('created firewall')
    console.log(`Created hids firewall for ${clusterData.clientName}`)
})
.catch((err) => {
    console.log(err)
})
// }
console.log('done')
