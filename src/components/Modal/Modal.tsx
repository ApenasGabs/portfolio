import React from "react";
import { FC } from "react";

interface ModalProps {
  isModalOpen: boolean;
  onClose: () => void;
}

const Modal: FC<ModalProps> = ({ isModalOpen, onClose }) => {
  return (
    <>
      <input
        type="checkbox"
        id="my-modal"
        className="modal-toggle"
        defaultChecked={isModalOpen}
      />
      <div className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h2 className="text-lg font-bold">🚧 Estamos em reforma 🚧</h2>
          <p>
            Para facilitar a manutenção estou refazendo para que ele pegue meus
            repositórios de forma automática usando a API do github.
          </p>
          <p>
            Por enquanto já temos a lista dos repositórios com algumas
            informações, mas sem CSS 😅
          </p>
          <div className="modal-action">
            <a
              href="https://github.com/ApenasGabs/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              Ver como isso é feito 🤔
            </a>
            <label
              htmlFor="my-modal"
              className="btn btn-primary"
              onClick={onClose}
            >
              Ver portfolio 👀
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
