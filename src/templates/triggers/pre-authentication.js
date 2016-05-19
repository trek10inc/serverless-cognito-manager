'use strict';
console.log('Loading function');

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // Check for the event type
    if (event.eventType === 'SyncTrigger') {

        // Modify value for a key
        if ('SampleKey1' in event.datasetRecords) {
            event.datasetRecords.SampleKey1.newValue = 'ModifyValue1';
            event.datasetRecords.SampleKey1.op = 'replace';
        }

        // Remove a key
        if ('SampleKey2' in event.datasetRecords) {
            event.datasetRecords.SampleKey2.op = 'remove';
        }

        // Add a key
        if (!('SampleKey3' in event.datasetRecords)) {
            event.datasetRecords.SampleKey3 = {
                newValue: 'ModifyValue3',
                op: 'replace'
            };
        }
    }

    callback(null, event);
};
