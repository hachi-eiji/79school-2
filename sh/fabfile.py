from fabric.api import local,run, task,env
from fabric.decorators import task
from fabric.utils import abort
from fabric.colors import *
import os
import json
from hipster import Hipster

@task
def test():
    hipchat = Hipster(os.environ['hipchat_token'])
    hipchat.send_messages(room_id=os.environ['hipchat_room'], sender='552760', message='Hello, room!')

@task
def deploy():
    print(green("{TARGET_ENV}".format(**os.environ)))
    if "env" in os.environ:
        print(green("{env}".format(**os.environ)))

    print(green("call deploy"))
