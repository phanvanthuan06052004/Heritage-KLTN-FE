.PHONY: build-local sync build up down restart deploy logs status ssh

build-local:
	python deploy.py build-local

sync:
	python deploy.py sync

build:
	python deploy.py build

up:
	python deploy.py up

down:
	python deploy.py down

restart:
	python deploy.py restart

deploy:
	python deploy.py deploy

logs:
	python deploy.py logs

status:
	python deploy.py status

ssh:
	python deploy.py ssh
