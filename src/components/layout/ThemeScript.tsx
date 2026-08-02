export function ThemeScript() {
  const code = `(function(){try{
    var raw = localStorage.getItem('ziva.agent.ai.v1');
    var s = raw ? (JSON.parse(raw).state||{}).settings||{} : {};
    var t = s.theme || 'dark';
    var a = s.accent || 'aurora';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var el = document.documentElement;
    el.classList.toggle('dark', dark);
    el.setAttribute('data-accent', a);
    if (s.motion === false) el.classList.add('no-motion');
  }catch(e){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-accent','aurora');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
