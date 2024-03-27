import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import JsonView from 'react18-json-view';
import { getAnalytics, logEvent } from 'firebase/analytics';

const json = {
  name: 'Ryan Rasmussen',
  location: 'Omaha, NE',
  title: 'Full Stack Software Engineer',
  linkedin: 'https://linkedin.com/in/ryanrasmussen05/',
  github: 'https://github.com/ryanrasmussen05',
  experience: {
    LinkedIn: { employer: 'LinkedIn', title: 'Senior Software Engineer', start: '2020-04-06', end: null },
    Aviture: { employer: 'Aviture', title: 'Senior Software Engineer', start: '2014-07-01', end: '2020-04-03' },
    'Lockheed Martin': {
      employer: 'Lockheed Martin',
      title: 'Software Engineer',
      start: '2013-06-10',
      end: '2014-06-29',
    },
    'Nebraska Global': {
      employer: 'Nebraska Global',
      title: 'Software Engineer Intern',
      start: '2012-09-01',
      end: '2013-05-31',
    },
    'Duncan Aviation': {
      employer: 'Duncan Aviation',
      title: 'Software Engineer Intern',
      start: '2011-12-01',
      end: '2012-08-31',
    },
  },
};

const links = {
  projects: [
    {
      title: 'Courage From Above (iOS)',
      link: 'https://apps.apple.com/us/app/courage-from-above/id1366354886?app=itunes&ign-mpt=uo%3D4',
      analyticsName: 'courage-from-above-ios',
    },
    {
      title: 'Courage From Above (Android)',
      link: 'https://play.google.com/store/apps/details?id=com.sac.sac_ww2',
      analyticsName: 'courage-from-above-android',
    },
    {
      title: 'Sphero Labyrhinth',
      link: 'https://play.google.com/store/apps/details?id=com.rhino.sacsphero',
      analyticsName: 'sphero-labyrhinth',
    },
    {
      title: 'Foscam Control Center',
      link: 'https://play.google.com/store/apps/details?id=com.rhino.foscam',
      analyticsName: 'foscam-control-center',
    },
  ],
  sandbox: [
    { title: 'Omaha Flight Tracker', path: '/flight-tracker', analyticsName: 'flight-tracker' },
    { title: 'Particles', path: '/particles', analyticsName: 'particles' },
    { title: 'Fireworks', path: '/fireworks', analyticsName: 'fireworks' },
    { title: 'Solar System', path: '/solar-system', analyticsName: 'solar-system' },
    { title: 'Monty Hall Paradox', path: '/monty-hall', analyticsName: 'monty-hall' },
  ],
};

function HomePage() {
  const analytics = getAnalytics();

  const linkClick = (item: any) => {
    logEvent(analytics, `link_click_${item.analyticsName}`);
  };

  return (
    <>
      <h1 className={styles.header}>{`> Ryan Rasmussen`}</h1>
      <div className={styles.description}>
        Minimalist profile website to show off projects and sandbox for playing around with UI libraries
      </div>
      <div className={styles.jsonViewer}>
        <JsonView
          src={json}
          dark={true}
          theme="vscode"
          enableClipboard={false}
          collapsed={2}
          displaySize="collapsed"
          matchesURL={true}
        />
      </div>

      <div className={styles.projects}>
        <h2>Projects</h2>
        <ul>
          {links.projects.map((project) => (
            <li key={project.title}>
              <a href={project.link} target="_blank" onClick={() => linkClick(project)}>
                {project.title}
              </a>
            </li>
          ))}
        </ul>

        <h2>Sandbox</h2>
        <ul>
          {links.sandbox.map((sandboxItem) => (
            <li key={sandboxItem.title}>
              <Link to={sandboxItem.path} onClick={() => linkClick(sandboxItem)}>
                {sandboxItem.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default HomePage;
