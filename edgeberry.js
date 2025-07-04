module.exports = function(RED) {
  const dbus = require('dbus-next');
  const bus = dbus.systemBus();

  async function sendAppInfo(info) {
    const service = await bus.getProxyObject('io.edgeberry.Core', '/io/edgeberry/Core');
    const iface = service.getInterface('io.edgeberry.Core');
    await iface.SetApplicationInfo(JSON.stringify(info));
  }

  async function sendAppStatus(status) {
    const service = await bus.getProxyObject('io.edgeberry.Core', '/io/edgeberry/Core');
    const iface = service.getInterface('io.edgeberry.Core');
    await iface.SetApplicationStatus(JSON.stringify(status));
  }

  async function sendIdentify() {
    const service = await bus.getProxyObject('io.edgeberry.Core', '/io/edgeberry/Core');
    const iface = service.getInterface('io.edgeberry.Core');
    await iface.Identify();
  }

  function EdgeberryNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async function(msg) {
      try {
        if (msg.payload.info) {
          await sendAppInfo(msg.payload.info);
          node.log('Sent application info to Edgeberry');
        }
        if (msg.payload.status) {
          await sendAppStatus(msg.payload.status);
          node.log('Sent application status to Edgeberry');
        }
        if (msg.topic === "identify" ) {
          await sendIdentify();
          node.log('Sent identify request to Edgeberry');
        }
      } catch (err) {
        node.error(`Edgeberry DBus error: ${err}`);
      }
      node.send(msg);
    });
  }

  RED.nodes.registerType("edgeberry", EdgeberryNode);
}