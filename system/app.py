import numpy as np
import pandas as pd
import sys, os
from dimension_reduction import get_projection_value
from shapely import get_shapely_value
from simulation import get_simulation_output
from flask import Flask
from flask import Flask, request, abort
from flask import render_template
from flask import jsonify

if "SUMO_HOME" in os.environ:
    tools = os.path.join(os.environ["SUMO_HOME"], "tools")
    sys.path.append(tools)
else:
    sys.exit("Please declare the environment variable 'SUMO_HOME'")

app = Flask(__name__)
@app.route('/')
def hello_world():  # put application's code here
    print("python flask server run")
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)

@app.route('/data/UMAP/projection_value', methods=['POST'])
def projection_value():
    data = request.get_json()
    method = data.get('method')
    network = data.get('network')
    parameter = data.get('parameter')
    sig_list = data.get('sig_filter')
    st = data.get('time_st')
    ed = data.get('time_ed')
    rm_list = data.get('list')
    projection_value = get_projection_value(method, network, parameter, sig_list, st, ed, rm_list)
        
    return jsonify({'projection_value': projection_value.tolist()})

@app.route('/data/shapely_value', methods=['POST'])
def shapely_value():
    data = request.get_json()
    method = data.get('method')
    network = data.get('network')
    parameter = data.get('parameter')
    sig_list = data.get('sig_filter')
    st = data.get('time_st')
    ed = data.get('time_ed')
    rm_list = data.get('list')

    svalue = get_shapely_value(method, network, parameter, sig_list, st, ed, rm_list)

    return jsonify({'shapely_value': svalue[0], 'feature_names': svalue[1]})


@app.route('/data/simulation_output', methods=['POST'])
def simulation_output():
    data = request.get_json()

    network = data.get('network')
    target = data.get('target')
    output_loc = data.get('output_loc')
    
    spd, loss, tt, run_time = get_simulation_output(network, target, output_loc)

    return jsonify({'spd': spd, 'loss': loss, 'tt': tt, 'time':run_time})