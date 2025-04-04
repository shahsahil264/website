---
title: Node Scenarios
description: 
date: 2017-01-04
weight: 1
---
This scenario disrupts the node(s) matching the label or node name(s) on a Kubernetes/OpenShift cluster.

# Recovery Times 

In each node scenario, the end telemetry details of the run will show the time it took for each node to stop and recover depening on the scenario.  

The details printed in telemetry:
- *node_name*: Node name 
- *node_id*: Node id 
- *not_ready_time*: Amount of time the node took to get to a not ready state after cloud provider has stopped node
- *ready_time*: Amount of time the node took to get to a ready state after cloud provider has become in started state
- *stopped_time*: Amount of time the cloud provider took to stop a node
- *running_time*: Amount of time the cloud provider took to get a node running
- *terminating_time*: Amount of time the cloud provider took for node to become terminated

Example: 
```
"affected_nodes": [
    {
        "node_name": "cluster-name-**.438115.internal",
        "node_id": "cluster-name-**",
        "not_ready_time": 0.18194103240966797,
        "ready_time": 0.0,
        "stopped_time": 140.74104499816895,
        "running_time": 0.0,
        "terminating_time": 0.0
    },
    {
        "node_name": "cluster-name-**-master-0.438115.internal",
        "node_id": "cluster-name-**-master-0",
        "not_ready_time": 0.1611928939819336,
        "ready_time": 0.0,
        "stopped_time": 146.72056317329407,
        "running_time": 0.0,
        "terminating_time": 0.0
    },
    {
        "node_name": "cluster-name-**.438115.internal",
        "node_id": "cluster-name-**",
        "not_ready_time": 0.0,
        "ready_time": 43.521320104599,
        "stopped_time": 0.0,
        "running_time": 12.305592775344849,
        "terminating_time": 0.0
    },
    {
        "node_name": "cluster-name-**-master-0.438115.internal",
        "node_id": "cluster-name-**-master-0",
        "not_ready_time": 0.0,
        "ready_time": 48.33336925506592,
        "stopped_time": 0.0,
        "running_time": 12.052034854888916,
        "terminating_time": 0.0
    }
```

