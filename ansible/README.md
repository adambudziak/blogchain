ansible-django-docker
=====================

Ansible Playbook designed for environments running a Django app.  It can install and configure these applications that are commonly used in production Django deployments:

- Nginx
- Docker
- CloudWatch

Default settings are stored in ```group_vars/all.yml```.  Environment-specific settings are in the ```group_vars/XXX.yml``` directory.

**Tested with OS:** Ubuntu 16.04 LTS x64 / 18.04 LTS x64

**Tested with Cloud Providers:** [Amazon](https://aws.amazon.com)

### Requirements

- [Ansible](http://docs.ansible.com/intro_installation.html)

The main settings to change here is in the **group_vars** file, where you can configure the location of your project, 
the project name, and application name which will be used throughout the Ansible configuration.

Note that the default values in the playbooks assume that your project structure looks something like this:

```
├── COPYING
├── Jenkinsfile
├── LICENSE
├── README.md
├── ansible
│   ├── README.md
│   ├── ansible.cfg
│   ├── group_vars
│   ├── hosts
│   ├── main.yml
│   ├── playbooks
│   └── roles
├── backend
│   ├── config
│   ├── conftest.py
│   ├── locale
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements
│   ├── setup.cfg
│   ├── shared
│   └── blogchain
├── docker
│   ├── entrypoint_backend.sh
│   ├── local
│   └── production
├── docker-compose.yml
├── docs
│   ├── Makefile
│   └── source
├── env.example
└── shared
    ├── fixtures
    ├── media
    ├── static
    └── templates
```

If your app needs additional system packages installed, you can add them in `pip_install_packages`.


## Running the Ansible Playbook to provision servers

First, update an inventory file for the environment, for example:

```
# hosts

[master]
webserver1.example.com                	ansible_ssh_user=ubuntu

[develop]
webserver2.example.com             		ansible_ssh_user=ubuntu
```

Run the playbook:

```
ansible-playbook -i hosts main.yml -e env=develop
```

## Using Ansible for Django Deployments

When doing deployments, you can simply use the `--tags` option to only run those tasks with these tags.

For example, you can add the tag `deploy` to certain tasks that you want to execute as part of your deployment process and then run this command:

```
ansible-playbook -i hosts main.yml --tags deploy -e env=develop
```

It is also possible select specific tag for deploy you container application. 

```
ansible-playbook -i hosts main.yml --tags deploy -e env=develop -e docker_tag="0.0.3"
```

This repo already has `deploy` tags specified for tasks that are likely needed to run during deployment in most Django environments.

## Advanced Options

### Jenkins

If you try run this command in your continuous integration or continuous delivery, please remember to add or copy 
environment file ```env.j2``` to ```roles/deploy/templates/```.

### Creating a swap file

By default, the playbook will create a swap file.  To create/enable swap, simply change the values in `roles/base/vars/main.yml`. 

You can also override these values in the main playbook, for example:

```
---
...
  roles:
   - { role: common,        tags: [ 'provisioning', 'deploy' ] }
   - { role: certbot,       tags: [ 'provisioning', 'certbot' ] }
   - { role: cloudwatch,    tags: [ 'provisioning', 'cloudwatch' ] }
   - { role: nginx,         tags: [ 'provisioning', 'deploy', 'nginx' ] }
   - { role: docker,        tags: [ 'provisioning', 'docker'] }
   - { role: deploy,        tags: [ 'provisioning', 'deploy' ],   become_user: "{{ ansible_ssh_user }}", docker_tag: "1.2.3" }
```

## Useful Links

- [Ansible - Getting Started](http://docs.ansible.com/intro_getting_started.html)
- [Ansible - Best Practices](http://docs.ansible.com/playbooks_best_practices.html)
