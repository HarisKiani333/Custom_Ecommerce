import { useState } from "react";
import { ImageUpIcon } from "lucide-react";
import { categories } from "../../assets/assets";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 animate-in fade-in-50 duration-700">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
            <span className="text-black"> 📦</span>
            Add New Product
          </h1>
          <p className="text-gray-600">
            Create and showcase your amazing products
          </p>
        </div>

        <form
          onSubmit={onSubmitHandler}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-700 delay-200"
        >
          <div className="animate-in slide-in-from-left-4 duration-500 delay-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🖼️</span>
              <p className="text-lg font-semibold text-gray-800">
                Product Images
              </p>
              <span className="text-sm text-gray-500">
                (Upload up to 4 images)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4)
                .fill("")
                .map((_, index) => (
                  <label
                    key={index}
                    htmlFor={`image${index}`}
                    className="group"
                  >
                    <input
                      onChange={(e) => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = e.target.files[0];
                        setFiles(updatedFiles);
                      }}
                      type="file"
                      id={`image${index}`}
                      hidden
                      accept="image/*"
                    />
                    {files[index] ? (
                      <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <img
                          className="w-full h-32 object-cover cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
                          alt="Product preview"
                          src={URL.createObjectURL(files[index])}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            Change Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-green-400 transition-all duration-300 group-hover:shadow-md">
                        <ImageUpIcon
                          size={24}
                          className="text-gray-400 group-hover:text-green-500 transition-colors duration-300"
                        />
                        <span className="text-xs text-gray-500 mt-1 group-hover:text-green-600">
                          Upload Image
                        </span>
                      </div>
                    )}
                  </label>
                ))}
            </div>
          </div>

          <div className="animate-in slide-in-from-left-4 duration-500 delay-400">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏷️</span>
              <label
                className="text-lg font-semibold text-gray-800"
                htmlFor="product-name"
              >
                Product Name
              </label>
            </div>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              id="product-name"
              type="text"
              placeholder="Enter an amazing product name..."
              className="w-full outline-none py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
              required
            />
          </div>
          <div className="animate-in slide-in-from-left-4 duration-500 delay-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📝</span>
              <label
                className="text-lg font-semibold text-gray-800"
                htmlFor="product-description"
              >
                Product Description
              </label>
            </div>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              id="product-description"
              rows={5}
              className="w-full outline-none py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md resize-none"
              placeholder="Describe your product in detail... What makes it special?"
            ></textarea>
          </div>
          <div className="animate-in slide-in-from-left-4 duration-500 delay-600">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📂</span>
              <label
                className="text-lg font-semibold text-gray-800"
                htmlFor="category"
              >
                Category
              </label>
            </div>
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              id="category"
              className="w-full outline-none py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md cursor-pointer"
              required
            >
              <option value="">🎯 Select a category for your product</option>
              {categories.map((item, index) => (
                <option key={index} value={item.path}>
                  {item.path}
                </option>
              ))}
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-500 delay-700">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💰</span>
                <label
                  className="text-lg font-semibold text-gray-800"
                  htmlFor="product-price"
                >
                  Product Price
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  id="product-price"
                  type="number"
                  placeholder="0.00"
                  className="w-full outline-none py-3 pl-8 pr-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏷️</span>
                <label
                  className="text-lg font-semibold text-gray-800"
                  htmlFor="offer-price"
                >
                  Offer Price
                </label>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Special Deal
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  onChange={(e) => setOfferPrice(e.target.value)}
                  value={offerPrice}
                  id="offer-price"
                  type="number"
                  placeholder="0.00"
                  className="w-full outline-none py-3 pl-8 pr-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-4 animate-in slide-in-from-bottom-4 duration-500 delay-800">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddProducts;
