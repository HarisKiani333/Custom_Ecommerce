import { useState } from "react";
import { ImageUpIcon } from "lucide-react";
import { categories } from "../../assets/assests";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddProducts = () => {
  const { axios } = useAppContext(); // Move this to top level
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [offerPrice, setOfferPrice] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      const productData = {
        name,
        description: description.split("\n"),
        price,
        category,
        offerPrice,
        inStock: true,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const { data } = await axios.post("/api/product/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setOfferPrice("");
        setFiles([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };
  return (
    <div className="py-10 flex flex-col justify-between bg-white">
      <form
        onSubmit={onSubmitHandler}
        className="md:p-10 p-4 space-y-5 max-w-lg"
      >
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    type="file"
                    id={`image${index}`}
                    hidden
                  />
                  {files[index] ? (
                    <img
                      className="max-w-24 cursor-pointer"
                      alt="uploadArea"
                      src={URL.createObjectURL(files[index])}
                      width={100}
                      height={100}
                    />
                  ) : (
                    <div className="w-[90px] h-[100px] flex items-center justify-center border rounded cursor-pointer">
                      <ImageUpIcon size={20} />
                    </div>
                  )}
                </label>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description
          </label>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
          ></textarea>
        </div>
        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">
            Category
          </label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
          >
            <option value="">Select Category</option>

            {categories.map((item, index) => (
              <option key={index} value={item.path}>
                {item.path}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
            </label>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price
            </label>
            <input
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full cursor-pointer"
        >
          ADD
        </button>
      </form>
    </div>
  );
};
export default AddProducts;
