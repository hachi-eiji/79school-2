from fabric.api import local,run, task
from fabric.state import env
from fabric.decorators import task
from fabric.colors import *
from fabric.state import env
import os

@task
def mvn_test():
    local("mvn clean test")
    print(green("finish test"))

@task
def deploy():
    print(green("{TARGET_ENV}".format(**os.environ)))
    if "env" in os.environ:
        print(green("{env}".format(**os.environ)))

    print(green("call deploy"))
