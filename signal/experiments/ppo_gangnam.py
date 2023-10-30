import os
import sys


if "SUMO_HOME" in os.environ:
    tools = os.path.join(os.environ["SUMO_HOME"], "tools")
    sys.path.append(tools)
else:
    sys.exit("Please declare the environment variable 'SUMO_HOME'")
import numpy as np
import pandas as pd
import ray
import libtraci as traci
from ray import tune
from ray.rllib.algorithms.ppo import PPOConfig
from ray.rllib.env.wrappers.pettingzoo_env import ParallelPettingZooEnv
from ray.tune.registry import register_env

import sumo_rl


if __name__ == "__main__":
    ray.init()
    print(int(os.environ.get("RLLIB_NUM_GPUS", "0")))
    env_name = "4x4Gangnam"

    register_env(
        env_name,
        lambda _: ParallelPettingZooEnv(
            sumo_rl.parallel_env(
                net_file="nets/Gangnam/gangnam.net.xml",
                route_file="nets/Gangnam/gangnam.rou.xml",
                out_csv_name="outputs/4x4Gangnam/ppo",
                use_gui=True,
                num_seconds=21600,
            )
        ),
    )
 
    config = (
        PPOConfig()
        .environment(env=env_name, disable_env_checking=True)
        .rollouts(num_rollout_workers=4, rollout_fragment_length=128)
        .training(
            train_batch_size=512,
            lr=2e-5,
            gamma=0.95,
            lambda_=0.9,
            use_gae=True,
            clip_param=0.4,
            grad_clip=None,
            entropy_coeff=0.1,
            vf_loss_coeff=0.25,
            sgd_minibatch_size=64,
            num_sgd_iter=10,
        )
        .debugging(log_level="ERROR")
        .framework(framework="torch")
        .resources(
            num_cpus_per_worker = 7,
            num_gpus_per_worker = 0.25 * int(os.environ.get("RLLIB_NUM_GPUS", "0")),
        )
    )

    tune.run(
        "PPO",
        name="PPO",
        stop={"timesteps_total": 21600},
        checkpoint_freq=10,
        local_dir="/ray_results/" + env_name,
        config=config.to_dict(),
    )
