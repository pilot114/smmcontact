
cron:
/usr/local/bin/php /usr/share/nginx/tn_crm/bin/console cron:tasks >>/var/log/tasklog 2>&1

mongoUI
docker run -d -p 3000:3000 mongoclient/mongoclient

docker run -ti -v `pwd`:/srv marmelab/bower bash -c "bower install --allow-root"

Более структурированная архитектура позволяет быстрее находить и исправлять проблемы,
но при этом требует знания этой самой структуры.
