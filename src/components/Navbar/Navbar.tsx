const projectsLinks = [
  <p className="text-xl">Deploys: </p>,
  <a
    className="btn btn-ghost text-xl"
    target="_blank"
    href="https://econow.apenasgabs.dev"
  >
    EcoNow
  </a>,
  <a
    className="btn btn-ghost text-xl"
    target="_blank"
    href="https://guia.apenasgabs.dev"
  >
    Guia de TI
  </a>,
  <a
    className="btn btn-ghost text-xl"
    target="_blank"
    href="https://querocasa.apenasgabs.dev"
  >
    Quero 🏠
    <span className="badge badge-sm badge-warning">NEW</span>
  </a>,
  <a
    className="btn btn-ghost text-xl"
    target="_blank"
    href="https://querotrampo.apenasgabs.dev"
  >
    Quero 👨‍💻
    <span className="badge badge-sm badge-warning">COMING SOON</span>
  </a>,
  <a
    className="btn btn-ghost text-xl"
    target="_blank"
    href="https://ghibli.list.apenasgabs.dev"
  >
    Ghibli film list
  </a>,
  <a
    className="btn btn-ghost text-xl"
    target="_blank"
    href="https://devpedia.apenasgabs.dev"
  >
    DevPedia Tools
    <span className="badge badge-sm badge-warning">ARCHIVED</span>
  </a>,
  <a
    className="btn btn-ghost text-xl"
    target="_blank"
    href="https://apenasblog.vercel.app/"
  >
    ApenasBlog
  </a>,
];
const Navbar = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {projectsLinks.map((projectLink) => (
              <li>{projectLink}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {projectsLinks.map((projectLink) => (
            <li>{projectLink}</li>
          ))}
        </ul>
      </div>
      <div className="navbar-end" />
    </div>
  );
};

export default Navbar;
