import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from umap.umap_ import UMAP

def get_projection_value(method, network, parameter, sig_list, st, ed, rm_list):
    id_list = []
    if network == '4x4':
        data_df = pd.read_csv('static/data/4x4/data.csv', index_col='Unnamed: 0')
        temp = 16
    elif network =='ing':
        data_df = pd.read_csv('static/data/ing/data.csv')
        temp = 20
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
        dnp = UMAP(n_neighbors=parameter, n_components=2, min_dist=0.0, n_jobs=20, metric="cosine", random_state=42).fit_transform(data_df_scale)
    elif method =='TSNE':
        dnp = TSNE(n_components = 2, perplexity=int(ed) - int(st), random_state=42).fit_transform(data_df_scale)
    elif method =='PCA':
        dnp = PCA(n_components=2, random_state=42).fit_transform(data_df_scale)
    else:
        return -1
    
    return dnp