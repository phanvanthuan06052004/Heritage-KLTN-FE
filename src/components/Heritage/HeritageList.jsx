import { cn } from "~/lib/utils";
import { useSelector } from "react-redux";
import { Inbox } from "lucide-react";
import HeritageCard from "./HeritageCard";
import { selectCurrentUser } from "~/store/slices/authSlice";
import { selectFavoriteMap } from "~/store/slices/favoriteSlice";

const EmptyState = () => (
  <div
    role="alert"
    className="col-span-full py-16 text-center flex flex-col items-center gap-3"
  >
    <div className="p-4 rounded-full bg-muted">
      <Inbox className="w-10 h-10 text-muted-foreground" />
    </div>
    <div>
      <h4 className="text-lg font-medium text-foreground">
        No heritage sites found
      </h4>
      <p className="text-sm text-muted-foreground mt-1">
        Try adjusting your search or filters.
      </p>
    </div>
  </div>
);

const HeritageList = ({ heritages, className, cardVariant }) => {
  const userInfo = useSelector(selectCurrentUser);
  const favoriteMap = useSelector(selectFavoriteMap);
  const isAuthenticated = !!userInfo;

  if (!heritages?.length) {
    return <EmptyState />;
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
        className,
      )}
    >
      {heritages.map((item) => (
        <li
          key={item._id}
          style={{ contentVisibility: "auto", containIntrinsicSize: "auto 450px" }}
        >
          <HeritageCard 
            item={item} 
            variant={cardVariant}
            isAuthenticated={isAuthenticated}
            isFavorited={!!favoriteMap[item._id]}
          />
        </li>
      ))}
    </ul>
  );
};

export default HeritageList;