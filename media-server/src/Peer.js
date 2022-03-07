module.exports = class Peer {
  constructor(socket_id, name, email) {
    this.id = socket_id
    this.name = name
    this.email = email;
    this.transports = new Map()
    this.consumers = new Map()
    this.recordingConsumers = new Map();
    this.producers = new Map()
    this.recordingProducers = new Map();
    this.remotePorts = [];
    this.process = undefined;
  }

  addTransport(transport) {
    this.transports.set(transport.id, transport)
  }

  async connectTransport(transport_id, dtlsParameters) {
    if (!this.transports.has(transport_id)) return

    await this.transports.get(transport_id).connect({
      dtlsParameters: dtlsParameters
    })
  }

  async createProducer(producerTransportId, rtpParameters, kind, isRecording) {
    //TODO handle null errors
    let producer = await this.transports.get(producerTransportId).produce({
      kind,
      rtpParameters
    })

    if (isRecording === true) {
      this.recordingProducers.set(producer.id, producer);
    } else {
      this.producers.set(producer.id, { name: this.name, producer: producer })
    }

    producer.on(
      'transportclose',
      function () {
        console.log('Producer transport close', { name: `${this.name}`, consumer_id: `${producer.id}` })
        producer.close()
        if (isRecording === true) {
          this.producers.delete(producer.id)
        } else {
          this.recordingProducers.delete(producer.id);
        }
      }.bind(this)
    )

    return producer
  }

  async createConsumer(consumer_transport_id, producer_id, rtpCapabilities, peerName) {
    let consumerTransport = this.transports.get(consumer_transport_id)

    let consumer = null
    try {
      consumer = await consumerTransport.consume({
        producerId: producer_id,
        rtpCapabilities,
        paused: false //producer.kind === 'video',
      })
    } catch (error) {
      console.error('Consume failed', error)
      return
    }

    if (consumer.type === 'simulcast') {
      await consumer.setPreferredLayers({
        spatialLayer: 2,
        temporalLayer: 2
      })
    }

    this.consumers.set(consumer.id, consumer)

    consumer.on(
      'transportclose',
      function () {
        console.log('Consumer transport close', { name: `${this.name}`, consumer_id: `${consumer.id}` })
        this.consumers.delete(consumer.id)
      }.bind(this)
    )

    return {
      consumer,
      params: {
        peerName: peerName,
        producerId: producer_id,
        consumerId: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused
      }
    }
  }

  closeProducer(producer_id, isRecording) {
    try {
      if (isRecording === true) {
        this.recordingProducers.get(producer_id).close();
        this.recordingProducers.delete(producer_id)
      } else {
        this.producers.get(producer_id).close();
        this.producers.delete(producer_id)
      }
    } catch (e) {
      console.warn(e)
    }

  }

  getProducer(producer_id) {
    return this.producers.get(producer_id)
  }

  close() {
    this.transports.forEach((transport) => transport.close())
  }

  removeConsumer(consumer_id) {
    this.consumers.delete(consumer_id)
  }
}
