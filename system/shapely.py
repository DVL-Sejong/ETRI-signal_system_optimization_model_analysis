import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from umap.umap_ import UMAP
from sklearn.ensemble import RandomForestRegressor
import shap

def get_shapely_value(method, network, parameter, sig_list, st, ed, rm_list):
    id_list = []
    if network == '4x4':
        temp = 16
        data_df = pd.read_csv('static/data/' + network + '/data.csv', index_col='Unnamed: 0')
    elif network =='ing':
        temp = 20
        data_df = pd.read_csv('static/data/' + network + '/data.csv')
    elif network =='gangnam':
        data_df = pd.read_csv('static/data/gangnam/data.csv')
        temp = 28
    if rm_list != '':
        data_df = data_df.drop(columns=rm_list)
    data_df = data_df[int(st)*temp:int(ed)*temp]

    if sig_list != '':
        for t in sig_list:
            for i in range(int(t), len(data_df), temp):
                id_list.append(i)
    
        id_list = sorted(id_list)
        data_df = data_df.iloc[id_list]

    scaler=StandardScaler()
    data_df_scale = scaler.fit_transform(data_df)

    if method == 'UMAP':
        dnp = UMAP(n_neighbors=parameter, n_components=1, min_dist=0.0, n_jobs=20, metric="cosine").fit_transform(data_df_scale)
    elif method =='TSNE':
        dnp = TSNE(n_components = 1, perplexity=int(ed) - int(st), random_state=42).fit_transform(data_df_scale)
    elif method =='PCA':
        dnp = PCA(n_components=1, random_state=42).fit_transform(data_df_scale)
    else:
        return -1
    
    reg = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42).fit(data_df_scale, dnp)
    tree_explainer = shap.TreeExplainer(reg)
    shap_values = tree_explainer.shap_values(data_df_scale)
    feature_names = data_df.columns

    temp_arr = [[0] * (105-len(rm_list)) for _ in range(28)]
    t_arr = [0 for _ in range((105-len(rm_list)))]
    arr = []
    
    if network == '4x4':
        for i in range(len(shap_values)):
            for j in range(len(shap_values[0])):
                temp_arr[i%temp][j] += shap_values[i][j]
        for i in range(16):
            for j in range(len(shap_values[0])):
                temp_arr[i][j] /= (len(shap_values) / 16)
        for i in range((81-len(rm_list))):
            for j in range(16):
                t_arr[i] += temp_arr[j][i]
        for i in range((81-len(rm_list))):
            t_arr[i] /= 16
        arr.append(list(t_arr[:(81-len(rm_list))]))
        arr.append(list(feature_names))
    
    elif network == 'ing' or network == 'gangnam':
        for i in range(len(shap_values)):
            for j in range(len(shap_values[0])):
                temp_arr[i%temp][j] += shap_values[i][j]
        for i in range(temp):
            for j in range(len(shap_values[0])):
                temp_arr[i][j] /= (len(shap_values) / temp)
        for i in range((105-len(rm_list))):
            for j in range(temp):
                t_arr[i] += temp_arr[j][i]
        for i in range((105-len(rm_list))):
            t_arr[i] /= temp
        arr.append(list(t_arr))
        arr.append(list(feature_names))

    abs_values = [abs(value) for value in arr[0]]
    total = sum(abs_values)
    arr[0] = [abs_value / total for abs_value in abs_values]
    sorted_indices = sorted(range(len(arr[0])), key=lambda k: arr[0][k], reverse=True)
    arr[0] = [arr[0][i] for i in sorted_indices]
    arr[1] = [arr[1][i] for i in sorted_indices]

    df = data_df[[col for col in data_df.columns if col in arr[1][:20]]]
    df.to_csv('static/data/corr_df.csv', index=False)
    return arr

