const Compute = require('@google-cloud/compute')
const compute = new Compute({
    projectId: 'apitesting-219717',
    keyFilename: './keyFile.json'
})
const zone = compute.zone('us-east1-b')
const name = 'test-api-create-ubuntu7'

const config = {
    os: 'ubuntu',
    http: true,
    https: true,
    machineType: 'n1-standard-1',
    tags: [
        'wazuh'
    ]
}

zone.createVM(name, config)
.then((data) => {
    const vm = data[0]
    const operation = data[1]
    const apiResponse = data[2]
    console.log(vm)
    return zone.vm(name).getMetadata()
})
.then((data) => {
    const meta = data[0]
    console.log(meta)
    const fingerprint = meta.metadata.fingerprint
    console.log(fingerprint)
    setMeta = {
        'ssh-keys': 'dan:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC3ICEOuo94gsWGokqS1kwdmZkIkpNPwcTILyawNb5HtWamfmrd+AFQwqrE60U7NOSWiP6ZtFD5IoxN9dABK/fC9CkmJlPdDJswGMe5JWK/vg7EPaOBYGKddD0E2eoANfYON2caO3l7X6FX5YZ0yVUqVbPcMPu+fb3Q3LVizJ6cT9CXgobVPK5mC2kom/V3MtNGt0TjrVIYjs1N9PpGVqEsu8aoR7iRYENfxyjjco0+jMdtZAu+TJ66LvQ/nVM0Gclpe1tVTGx0fwv3MokNmvEVnewjVys7WYpyvgnxqtvyzFtKmM96LqyQuvrSqrldFZFyOK6at/aFj+zVXO5FT+kWSfek9tfU2j9mRKpGqu/eX00r3OemBUGLY1Sr30/Ni3UAVyPIXZ9woCHeTFY2NR12njkJM5A2bTZxBWrL+i2ll4zEPm5DbLh/oaQTPF6RAyv03l3oOHjRLqh+u2y+ADRi9Mt1BeaI9eaNOqlQUuMm+e9IMmYThpq/rlPPvdtuRTOy/GZE8sExhzrSmo8rCPCKhM1rTTdXXWog824eG4WzUISj2/KyoeHXXz/Q2CSma7IOfFwDBM3GD963VldtzovnaQ+ZyNShidcP4ybgZDk35O6PtCqMJWB1S1uuwT95Gioa/aTotyuHGm4tzKaYiQe7/fm+gu/bsMZ9rD+WeD+KGQ== dan\n'
    }
    return zone.vm(name).setMetadata(setMeta)
})
.then(() => {
    console.log("Set the meta data!!!!")
})
.catch((err) => {
    console.log(err)
})