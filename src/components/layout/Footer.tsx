
import { Container } from "@/components/ui/container";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-500">© lomuebles.es {currentYear}</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-700 text-sm">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-700 text-sm">
              Условия использования
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
