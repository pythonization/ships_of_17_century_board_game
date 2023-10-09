# Use of vite

## Why exactly that Vite integration

1) react here [Adding React](https://react.dev/learn/add-react-to-an-existing-project)  suggest use of Vite
2) here [awesome vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) suggested 2 integrations
3) Selected [Less popular but simple](https://github.com/protibimbok/django-vite-plugin) Not selected [Oldest, popular, complex](https://github.com/MrBin99/django-vite) . But maybe this was wrong selection.

## Problems with protibimbok/django-vite-plugin

+ HMR not working for me (or I not configured something).
+ Other 2 bugs - search protibimbok in code (maybe it is configuration or Vite problem)

## How

According to [Docs of selected integration](https://github.com/protibimbok/django-vite-plugin)

```bash
pip install django_vite_plugin

# Do not perform:
# npm install django-vite-plugin
```

Continue with steps from django_vite_plugin, but only that steps, that are related to .py and .html files.

According to [Vite docs](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)

```bash
npm create vite@latest
```

Answers on questions of "create vite@latest"

+ install "create-vite@4.4.1": yes
+ Project name: empty_project
+ Select a framework: React
+ Select a variant: JavaScript

Run as "create vite@latest" suggested

```bash
cd empty_project
npm install

# if you want to test Django without Vite
npm run dev
```

You can test now Vite without Django. Now stop Vite server and run:

```bash
npm install django-vite-plugin

mv node_modules/ ..
mv package.json package-lock.json vite.config.js .eslintrc.cjs .gitignore ..
cd ..
mv empty_project/ not_need_parts_of_vite_project
```

continue [here](https://github.com/protibimbok/django-vite-plugin#vite)
with modifying `vite.config.js`

Then run the following commands in two separate terminals:

```bash
# terminal 1
python manage.py runserver
```

```bash
# terminal 2
npm run dev
```
