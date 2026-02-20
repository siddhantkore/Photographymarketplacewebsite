import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export function AdminProductForm() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Product title" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Product description" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                  <SelectItem value="typography">Typography</SelectItem>
                  <SelectItem value="poster">Poster</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="orientation">Orientation</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceHD">HD Price (₹)</Label>
              <Input id="priceHD" type="number" placeholder="299" />
            </div>
            <div>
              <Label htmlFor="priceFullHD">Full HD Price (₹)</Label>
              <Input id="priceFullHD" type="number" placeholder="599" />
            </div>
            <div>
              <Label htmlFor="price4K">4K Price (₹)</Label>
              <Input id="price4K" type="number" placeholder="999" />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit">Save Product</Button>
            <Button type="button" variant="outline">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
